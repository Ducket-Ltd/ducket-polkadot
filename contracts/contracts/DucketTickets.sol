// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DucketTickets
 * @dev ERC1155 NFT contract for event tickets with resale price caps on Polkadot Hub
 * Each token ID represents a different ticket tier for an event
 */
contract DucketTickets is ERC1155, AccessControl, ERC1155Supply, ReentrancyGuard {
    using Strings for uint256;
    using SafeERC20 for IERC20;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Collection metadata
    string public name = "Ducket Tickets";
    string public symbol = "DUCKET";
    string private _baseURI;
    string private _contractURI;

    struct Event {
        string eventName;
        uint256 eventDate;
        address organizer;
        uint16 maxResalePercentage;
        uint256 totalSupply;
        uint256 maxTicketsPerWallet;
        bool resaleEnabled;
        bool transferEnabled;
        bool exists;
    }

    struct TicketTier {
        uint256 eventId;
        string tierName;
        string seatPrefix;
        uint256 price;          // native DOT price (18 decimals on PAS testnet)
        uint256 stablePrice;    // USDC price (6 decimal units, e.g. 25_000_000 = $25)
        uint256 maxSupply;
        uint256 minted;
        bool exists;
    }

    struct ResaleListing {
        address seller;
        uint256 price;
        bool active;
        bool isStablecoin;  // true if price is in stablecoin (6 decimals), false if native DOT
    }

    // Event ID counter
    uint256 private _eventIdCounter;

    // Token ID counter
    uint256 private _tokenIdCounter;

    // Mappings
    mapping(uint256 => Event) public events;
    mapping(uint256 => TicketTier) public ticketTiers;
    mapping(uint256 => mapping(uint256 => uint256)) public originalPrices;
    mapping(uint256 => mapping(uint256 => ResaleListing)) public resaleListings;
    mapping(uint256 => mapping(address => uint256)) public eventPurchases;

    // Platform settings
    uint256 public platformFee = 250;
    address public platformWallet;
    address public paymentToken;  // ERC-20 stablecoin address (e.g. MockUSDC)

    // Events
    event EventCreated(uint256 indexed eventId, string eventName, address indexed organizer, uint256 totalSupply);
    event TicketTierCreated(uint256 indexed tokenId, uint256 indexed eventId, string tierName, uint256 price, uint256 maxSupply);
    event TicketMinted(uint256 indexed tokenId, address indexed to, uint256 ticketNumber, uint256 price);
    event TicketListedForResale(uint256 indexed tokenId, uint256 ticketNumber, address indexed seller, uint256 price);
    event TicketResold(uint256 indexed tokenId, uint256 ticketNumber, address indexed from, address indexed to, uint256 price);
    event ResaleListingCancelled(uint256 indexed tokenId, uint256 ticketNumber);

    constructor(address _platformWallet) ERC1155("") {
        require(_platformWallet != address(0), "Invalid platform wallet");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        platformWallet = _platformWallet;
    }

    // Collection metadata
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setContractURI(string memory newContractURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _contractURI = newContractURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(ticketTiers[tokenId].exists, "Token does not exist");
        return string(abi.encodePacked(_baseURI, Strings.toString(tokenId)));
    }

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseURI = newuri;
    }

    /**
     * @dev Create a new event
     */
    function createEvent(
        string memory eventName,
        uint256 eventDate,
        uint16 maxResalePercentage,
        uint256 maxTicketsPerWallet,
        uint256 totalSupply,
        bool resaleEnabled,
        bool transferEnabled
    ) external returns (uint256) {
        require(bytes(eventName).length > 0, "Name required");
        require(eventDate > block.timestamp, "Event must be in future");
        require(maxResalePercentage >= 100 && maxResalePercentage <= 200, "Resale % must be 100-200");

        uint256 eventId = _eventIdCounter++;
        events[eventId] = Event({
            eventName: eventName,
            eventDate: eventDate,
            organizer: msg.sender,
            maxResalePercentage: maxResalePercentage,
            totalSupply: totalSupply,
            maxTicketsPerWallet: maxTicketsPerWallet,
            resaleEnabled: resaleEnabled,
            transferEnabled: transferEnabled,
            exists: true
        });

        emit EventCreated(eventId, eventName, msg.sender, totalSupply);
        return eventId;
    }

    /**
     * @dev Create a new ticket tier for an event
     */
    function createTicketTier(
        uint256 eventId,
        string memory tierName,
        string memory seatPrefix,
        uint256 price,
        uint256 stablePrice,
        uint256 maxSupply
    ) external returns (uint256) {
        require(events[eventId].exists, "Event does not exist");
        require(msg.sender == events[eventId].organizer, "Only organizer can create tiers");
        require(bytes(tierName).length > 0, "Name required");

        uint256 tokenId = _tokenIdCounter++;
        ticketTiers[tokenId] = TicketTier({
            eventId: eventId,
            tierName: tierName,
            seatPrefix: seatPrefix,
            price: price,
            stablePrice: stablePrice,
            maxSupply: maxSupply,
            minted: 0,
            exists: true
        });

        emit TicketTierCreated(tokenId, eventId, tierName, price, maxSupply);
        return tokenId;
    }

    /**
     * @dev Mint tickets (primary sale)
     */
    function mintTicket(
        uint256 tokenId,
        address to,
        uint256 quantity
    ) external payable nonReentrant onlyRole(MINTER_ROLE) {
        TicketTier storage tier = ticketTiers[tokenId];
        require(tier.exists, "Ticket tier does not exist");
        require(tier.minted + quantity <= tier.maxSupply, "Exceeds max supply");

        Event storage eventData = events[tier.eventId];
        if (eventData.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[tier.eventId][to] + quantity <= eventData.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        uint256 totalPrice = tier.price * quantity;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint the tickets
        _mint(to, tokenId, quantity, "");

        // Record original prices and emit events
        for (uint256 i = 0; i < quantity; i++) {
            originalPrices[tokenId][tier.minted + i] = tier.price;
            emit TicketMinted(tokenId, to, tier.minted + i, tier.price);
        }

        tier.minted += quantity;
        eventPurchases[tier.eventId][to] += quantity;

        // Distribute payment
        uint256 fee = (totalPrice * platformFee) / 10000;
        uint256 organizerAmount = totalPrice - fee;

        if (fee > 0) {
            (bool sentFee, ) = platformWallet.call{value: fee}("");
            require(sentFee, "Failed to send platform fee");
        }

        (bool sentOrganizer, ) = eventData.organizer.call{value: organizerAmount}("");
        require(sentOrganizer, "Failed to send to organizer");

        // Refund excess
        if (msg.value > totalPrice) {
            (bool refunded, ) = msg.sender.call{value: msg.value - totalPrice}("");
            require(refunded, "Failed to refund excess");
        }
    }

    /**
     * @dev List ticket for resale
     */
    function listForResale(
        uint256 tokenId,
        uint256 ticketNumber,
        uint256 price,
        bool isStablecoin
    ) external {
        require(balanceOf(msg.sender, tokenId) > 0, "You don't own this ticket");

        TicketTier storage tier = ticketTiers[tokenId];
        Event storage eventData = events[tier.eventId];
        require(eventData.resaleEnabled, "Resale disabled for this event");

        uint256 originalPrice = originalPrices[tokenId][ticketNumber];
        uint256 maxPrice = (originalPrice * eventData.maxResalePercentage) / 100;

        require(price <= maxPrice, "Price exceeds resale cap");
        require(!resaleListings[tokenId][ticketNumber].active, "Already listed");

        resaleListings[tokenId][ticketNumber] = ResaleListing({
            seller: msg.sender,
            price: price,
            active: true,
            isStablecoin: isStablecoin
        });

        emit TicketListedForResale(tokenId, ticketNumber, msg.sender, price);
    }

    /**
     * @dev Buy ticket from resale market
     */
    function buyResaleTicket(
        uint256 tokenId,
        uint256 ticketNumber
    ) external payable nonReentrant {
        ResaleListing storage listing = resaleListings[tokenId][ticketNumber];
        require(listing.active, "Ticket not listed for resale");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        listing.active = false;

        // Transfer the ticket
        _safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        // Distribute payment
        uint256 fee = (price * platformFee) / 10000;
        uint256 sellerAmount = price - fee;

        if (fee > 0) {
            (bool sentFee, ) = platformWallet.call{value: fee}("");
            require(sentFee, "Failed to send platform fee");
        }

        (bool sentSeller, ) = seller.call{value: sellerAmount}("");
        require(sentSeller, "Failed to send to seller");

        // Refund excess
        if (msg.value > price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
            require(refunded, "Failed to refund excess");
        }

        emit TicketResold(tokenId, ticketNumber, seller, msg.sender, price);
    }

    /**
     * @dev Cancel resale listing
     */
    function cancelResaleListing(uint256 tokenId, uint256 ticketNumber) external {
        ResaleListing storage listing = resaleListings[tokenId][ticketNumber];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Listing not active");

        listing.active = false;
        emit ResaleListingCancelled(tokenId, ticketNumber);
    }

    /**
     * @dev Get event details
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        require(events[eventId].exists, "Event does not exist");
        return events[eventId];
    }

    /**
     * @dev Get ticket tier details
     */
    function getTicketTier(uint256 tokenId) external view returns (TicketTier memory) {
        require(ticketTiers[tokenId].exists, "Tier does not exist");
        return ticketTiers[tokenId];
    }

    /**
     * @dev Get resale listing
     */
    function getResaleListing(uint256 tokenId, uint256 ticketNumber)
        external
        view
        returns (ResaleListing memory)
    {
        return resaleListings[tokenId][ticketNumber];
    }

    /**
     * @dev Set the ERC-20 payment token (stablecoin) address — admin only
     */
    function setPaymentToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        paymentToken = token;
    }

    /**
     * @dev Mint tickets using ERC-20 stablecoin payment (CONT-02)
     *      No MINTER_ROLE required — payment is the security gate.
     *      Caller must have approved this contract for at least (tier.stablePrice * quantity) tokens.
     */
    function mintTicketWithToken(
        uint256 tokenId,
        address to,
        uint256 quantity
    ) external nonReentrant {
        TicketTier storage tier = ticketTiers[tokenId];
        require(tier.exists, "Ticket tier does not exist");
        require(tier.minted + quantity <= tier.maxSupply, "Exceeds max supply");
        require(tier.stablePrice > 0, "No stable price set for this tier");

        Event storage eventData = events[tier.eventId];
        if (eventData.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[tier.eventId][to] + quantity <= eventData.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        uint256 totalPrice = tier.stablePrice * quantity;

        // Pull-payment: caller must have approved this contract for totalPrice tokens
        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), totalPrice);

        // Mint the ERC1155 tickets
        _mint(to, tokenId, quantity, "");

        // Record original stablecoin prices and emit events
        for (uint256 i = 0; i < quantity; i++) {
            originalPrices[tokenId][tier.minted + i] = tier.stablePrice;
            emit TicketMinted(tokenId, to, tier.minted + i, tier.stablePrice);
        }

        tier.minted += quantity;
        eventPurchases[tier.eventId][to] += quantity;

        // Distribute stablecoin payment
        uint256 fee = (totalPrice * platformFee) / 10000;
        uint256 organizerAmount = totalPrice - fee;
        if (fee > 0) {
            IERC20(paymentToken).safeTransfer(platformWallet, fee);
        }
        IERC20(paymentToken).safeTransfer(eventData.organizer, organizerAmount);
    }

    /**
     * @dev Buy resale ticket using ERC-20 stablecoin payment (CONT-04)
     *      Listing must have been created with isStablecoin=true.
     *      Caller must have approved this contract for listing.price tokens.
     */
    function buyResaleTicketWithToken(
        uint256 tokenId,
        uint256 ticketNumber
    ) external nonReentrant {
        ResaleListing storage listing = resaleListings[tokenId][ticketNumber];
        require(listing.active, "Ticket not listed for resale");
        require(listing.isStablecoin, "Listing is not a stablecoin listing");

        address seller = listing.seller;
        uint256 price = listing.price;
        listing.active = false;

        // Pull stablecoin payment from buyer
        IERC20(paymentToken).safeTransferFrom(msg.sender, address(this), price);

        // Transfer ticket from seller to buyer
        _safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        // Distribute stablecoin payment
        uint256 fee = (price * platformFee) / 10000;
        uint256 sellerAmount = price - fee;
        if (fee > 0) {
            IERC20(paymentToken).safeTransfer(platformWallet, fee);
        }
        IERC20(paymentToken).safeTransfer(seller, sellerAmount);

        emit TicketResold(tokenId, ticketNumber, seller, msg.sender, price);
    }

    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }

    /**
     * @dev Update platform wallet
     */
    function setPlatformWallet(address newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newWallet != address(0), "Invalid address");
        platformWallet = newWallet;
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                uint256 tokenId = ids[i];
                if (ticketTiers[tokenId].exists) {
                    uint256 eventId = ticketTiers[tokenId].eventId;
                    Event storage eventData = events[eventId];
                    require(eventData.transferEnabled || eventData.resaleEnabled, "Transfers disabled");
                }
            }
        }
        super._update(from, to, ids, values);
    }
}
