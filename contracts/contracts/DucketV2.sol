// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DucketV2
 * @author Ducket
 * @notice Complete ticketing contract with communities, memberships, and all V1 functionality
 * @dev Standalone contract containing all features from EventTicketNFTV3 and DucketV1, plus:
 *      - Community registry for organizing groups (venues, collectives, organizers)
 *      - Membership tiers with expiry support
 *      - Event-to-community linking with access modes
 *      - Membership gates for ticketing (open, members free, members only)
 *      - Backwards compatible - existing events work unchanged
 */
contract DucketV2 is ERC1155, AccessControl, ERC1155Supply, ReentrancyGuard {
    using Strings for uint256;

    // ============================================================================
    // ROLES
    // ============================================================================

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // ============================================================================
    // STRUCTS - Core Ticketing (from EventTicketNFTV3)
    // ============================================================================

    /**
     * @notice Event configuration with per-event rules
     */
    struct EventConfig {
        address organizer;
        uint16 maxResalePercentage;
        bool resaleEnabled;
        bool transferEnabled;
        bool paused;
        bool cancelled;
        bool exists;
        string name;
        uint256 eventDate;
        uint256 maxTicketsPerWallet;
        uint256 totalSupply;
        uint256 mintedCount;
        uint256 resaleLockUntil;
        uint256 createdAt;
    }

    /**
     * @notice Ticket tier (token type) for an event
     */
    struct TicketTier {
        uint256 eventId;
        string name;
        string seatPrefix;
        uint256 price;
        uint256 maxSupply;
        uint256 minted;
        uint256 nextSeatIndex;
        bool exists;
    }

    /**
     * @notice Individual ticket metadata
     */
    struct TicketInfo {
        uint256 eventId;
        uint256 tierId;
        string seatIdentifier;
        uint256 originalPrice;
        uint256 purchaseTimestamp;
        address originalPurchaser;
        address currentOwner;
        bool exists;
    }

    /**
     * @notice Resale listing
     */
    struct ResaleListing {
        uint256 ticketId;
        address seller;
        uint256 price;
        bool active;
    }

    // ============================================================================
    // STRUCTS - Communities & Memberships (V2 additions)
    // ============================================================================

    /**
     * @notice Community configuration
     */
    struct Community {
        string name;
        address admin;
        bool exists;
        bool isActive;
    }

    /**
     * @notice Membership information for a user in a community
     */
    struct MembershipInfo {
        bool isActive;
        uint256 expiry;
        uint8 tier;
    }

    /**
     * @notice Access control settings for community events
     */
    struct MembershipGate {
        uint8 accessMode;      // 0 = open, 1 = members free, 2 = members only
        uint8 minTierRequired; // 0 = any member, 1+ = specific tier minimum
    }

    // ============================================================================
    // STATE VARIABLES - Collection Metadata
    // ============================================================================

    string public name = "Ducket Tickets";
    string public symbol = "DUCKET";
    string private _baseURI;
    string private _contractURI;

    // ============================================================================
    // STATE VARIABLES - Core Ticketing
    // ============================================================================

    uint256 internal _eventIdCounter;
    uint256 internal _tokenIdCounter;
    uint256 internal _ticketIdCounter;

    mapping(uint256 => EventConfig) public events;
    mapping(uint256 => TicketTier) public ticketTiers;
    mapping(uint256 => TicketInfo) public ticketInfos;
    mapping(uint256 => ResaleListing) public resaleListings;

    mapping(uint256 => mapping(address => uint256)) public eventPurchases;
    mapping(uint256 => mapping(string => uint256)) public seatRegistry;
    mapping(uint256 => uint256[]) internal _eventTickets;
    mapping(address => mapping(uint256 => uint256[])) internal _userEventTickets;
    mapping(uint256 => address) public ticketOwners;

    mapping(address => bool) public verifiedOrganizers;

    // Platform settings
    address public platformWallet;
    uint256 public platformFeePrimary = 250;
    uint256 public platformFeeResale = 250;
    uint256 public maxEventSupply = 100000;
    uint256 public maxTicketsPerTransaction = 10;
    bool public globalPause = false;

    // ============================================================================
    // STATE VARIABLES - Communities & Memberships (V2 additions)
    // ============================================================================

    mapping(uint256 => Community) public communities;
    uint256 public nextCommunityId = 1;

    mapping(uint256 => mapping(address => MembershipInfo)) public memberships;

    mapping(uint256 => uint256) public eventToCommunity;

    mapping(uint256 => MembershipGate) public eventMembershipGate;

    // ============================================================================
    // EVENTS - Core Ticketing
    // ============================================================================

    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer,
        uint256 totalSupply
    );

    event EventUpdated(uint256 indexed eventId);
    event EventPaused(uint256 indexed eventId, bool paused);
    event EventCancelled(uint256 indexed eventId);

    event TicketTierCreated(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        string name,
        uint256 price,
        uint256 maxSupply
    );

    event TicketMinted(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        uint256 indexed tokenId,
        address buyer,
        string seatIdentifier,
        uint256 price
    );

    event TicketTransferred(
        uint256 indexed ticketId,
        address indexed from,
        address indexed to
    );

    event TicketListedForResale(
        uint256 indexed ticketId,
        address indexed seller,
        uint256 price
    );

    event TicketResold(
        uint256 indexed ticketId,
        address indexed from,
        address indexed to,
        uint256 price
    );

    event ResaleListingCancelled(uint256 indexed ticketId);
    event OrganizerVerified(address indexed organizer, bool verified);
    event GlobalPauseSet(bool paused);
    event TierSupplyReleased(uint256 indexed tokenId, uint256 quantity);
    event WalletPurchasesReleased(uint256 indexed eventId, address indexed wallet, uint256 quantity);

    // ============================================================================
    // EVENTS - DucketV1 Features
    // ============================================================================

    event TicketBurned(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed holder,
        string reason
    );

    event PerkRedeemed(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        string perkType,
        uint256 timestamp
    );

    // ============================================================================
    // EVENTS - Communities & Memberships (V2 additions)
    // ============================================================================

    event CommunityCreated(
        uint256 indexed communityId,
        string name,
        address indexed admin
    );

    event CommunityUpdated(
        uint256 indexed communityId,
        string name,
        bool isActive
    );

    event CommunityOwnershipTransferred(
        uint256 indexed communityId,
        address indexed oldAdmin,
        address indexed newAdmin
    );

    event MembershipGranted(
        uint256 indexed communityId,
        address indexed user,
        uint8 tier,
        uint256 expiry
    );

    event MembershipRevoked(
        uint256 indexed communityId,
        address indexed user
    );

    event MembershipUpdated(
        uint256 indexed communityId,
        address indexed user,
        uint8 tier,
        uint256 expiry
    );

    event EventLinkedToCommunity(
        uint256 indexed eventId,
        uint256 indexed communityId,
        uint8 accessMode
    );

    event EventMembershipGateUpdated(
        uint256 indexed eventId,
        uint8 accessMode,
        uint8 minTierRequired
    );

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    modifier onlyOrganizer(uint256 eventId) {
        require(events[eventId].organizer == msg.sender, "Not organizer");
        _;
    }

    modifier onlyOrganizerOrPlatform(uint256 eventId) {
        require(
            events[eventId].organizer == msg.sender ||
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(events[eventId].exists, "Event not found");
        _;
    }

    modifier eventActive(uint256 eventId) {
        require(!events[eventId].paused, "Event paused");
        require(!events[eventId].cancelled, "Event cancelled");
        require(!globalPause, "Platform paused");
        _;
    }

    modifier tierExists(uint256 tokenId) {
        require(ticketTiers[tokenId].exists, "Tier not found");
        _;
    }

    modifier communityExists(uint256 communityId) {
        require(communities[communityId].exists, "Community not found");
        _;
    }

    modifier onlyCommunityAdmin(uint256 communityId) {
        require(communities[communityId].admin == msg.sender, "Not community admin");
        _;
    }

    modifier communityActive(uint256 communityId) {
        require(communities[communityId].isActive, "Community not active");
        _;
    }

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor(address _platformWallet) ERC1155("") {
        require(_platformWallet != address(0), "Invalid platform wallet");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        platformWallet = _platformWallet;

        _ticketIdCounter = 1;
    }

    // ============================================================================
    // COLLECTION METADATA
    // ============================================================================

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

    // ============================================================================
    // ON-CHAIN METADATA GETTER
    // ============================================================================

    function getTicketMetadata(uint256 ticketId) external view returns (
        uint256 eventId,
        uint256 tierId,
        string memory seatIdentifier,
        string memory eventName,
        string memory tierName,
        uint256 eventDate,
        address currentOwner
    ) {
        TicketInfo storage ticket = ticketInfos[ticketId];
        require(ticket.exists, "Ticket not found");

        EventConfig storage evt = events[ticket.eventId];
        TicketTier storage tier = ticketTiers[ticket.tierId];

        return (
            ticket.eventId,
            ticket.tierId,
            ticket.seatIdentifier,
            evt.name,
            tier.name,
            evt.eventDate,
            ticket.currentOwner
        );
    }

    // ============================================================================
    // REFUND SUPPLY RELEASE
    // ============================================================================

    function releaseTierSupply(uint256 tokenId, uint256 quantity)
        external
        onlyRole(MINTER_ROLE)
        tierExists(tokenId)
    {
        TicketTier storage tier = ticketTiers[tokenId];
        require(tier.minted >= quantity, "Cannot release more than minted");

        tier.minted -= quantity;

        EventConfig storage evt = events[tier.eventId];
        if (evt.mintedCount >= quantity) {
            evt.mintedCount -= quantity;
        }

        emit TierSupplyReleased(tokenId, quantity);
    }

    function releaseWalletPurchases(uint256 eventId, address wallet, uint256 quantity)
        external
        onlyRole(MINTER_ROLE)
        eventExists(eventId)
    {
        require(eventPurchases[eventId][wallet] >= quantity, "Cannot release more than purchased");
        eventPurchases[eventId][wallet] -= quantity;
        emit WalletPurchasesReleased(eventId, wallet, quantity);
    }

    // ============================================================================
    // EVENT MANAGEMENT
    // ============================================================================

    function createEvent(
        string memory _name,
        uint256 eventDate,
        uint16 maxResalePercentage,
        uint256 maxTicketsPerWallet,
        uint256 totalSupply,
        bool resaleEnabled,
        bool transferEnabled
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(eventDate > block.timestamp, "Event must be in future");
        require(maxResalePercentage >= 100 && maxResalePercentage <= 200, "Resale % must be 100-200");
        require(totalSupply > 0 && totalSupply <= maxEventSupply, "Invalid supply");

        uint256 eventId = _eventIdCounter++;

        events[eventId] = EventConfig({
            organizer: msg.sender,
            maxResalePercentage: maxResalePercentage,
            resaleEnabled: resaleEnabled,
            transferEnabled: transferEnabled,
            paused: false,
            cancelled: false,
            exists: true,
            name: _name,
            eventDate: eventDate,
            maxTicketsPerWallet: maxTicketsPerWallet,
            totalSupply: totalSupply,
            mintedCount: 0,
            resaleLockUntil: 0,
            createdAt: block.timestamp
        });

        emit EventCreated(eventId, _name, msg.sender, totalSupply);
        return eventId;
    }

    function updateEventConfig(
        uint256 eventId,
        uint16 maxResalePercentage,
        uint256 maxTicketsPerWallet,
        bool resaleEnabled,
        bool transferEnabled,
        uint256 resaleLockUntil
    ) external eventExists(eventId) onlyOrganizer(eventId) {
        EventConfig storage evt = events[eventId];

        if (evt.mintedCount > 0) {
            require(maxResalePercentage >= evt.maxResalePercentage, "Cannot decrease resale %");
            require(
                maxTicketsPerWallet == 0 ||
                (evt.maxTicketsPerWallet != 0 && maxTicketsPerWallet >= evt.maxTicketsPerWallet),
                "Cannot decrease wallet limit"
            );
            require(!evt.resaleEnabled || resaleEnabled, "Cannot disable resale");
            require(!evt.transferEnabled || transferEnabled, "Cannot disable transfers");
            require(resaleLockUntil <= evt.resaleLockUntil, "Cannot extend resale lock");
        }

        require(maxResalePercentage >= 100 && maxResalePercentage <= 200, "Resale % must be 100-200");

        evt.maxResalePercentage = maxResalePercentage;
        evt.maxTicketsPerWallet = maxTicketsPerWallet;
        evt.resaleEnabled = resaleEnabled;
        evt.transferEnabled = transferEnabled;
        evt.resaleLockUntil = resaleLockUntil;

        emit EventUpdated(eventId);
    }

    function setEventPaused(uint256 eventId, bool paused)
        external
        eventExists(eventId)
        onlyOrganizerOrPlatform(eventId)
    {
        events[eventId].paused = paused;
        emit EventPaused(eventId, paused);
    }

    function cancelEvent(uint256 eventId)
        external
        eventExists(eventId)
        onlyOrganizer(eventId)
    {
        require(events[eventId].mintedCount == 0, "Cannot cancel: tickets sold");
        events[eventId].cancelled = true;
        emit EventCancelled(eventId);
    }

    // ============================================================================
    // TICKET TIER MANAGEMENT
    // ============================================================================

    function createTicketTier(
        uint256 eventId,
        string memory _name,
        string memory seatPrefix,
        uint256 price,
        uint256 tierMaxSupply
    ) external eventExists(eventId) onlyOrganizer(eventId) returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(tierMaxSupply > 0, "Supply must be > 0");

        uint256 tokenId = _tokenIdCounter++;

        ticketTiers[tokenId] = TicketTier({
            eventId: eventId,
            name: _name,
            seatPrefix: seatPrefix,
            price: price,
            maxSupply: tierMaxSupply,
            minted: 0,
            nextSeatIndex: 0,
            exists: true
        });

        emit TicketTierCreated(tokenId, eventId, _name, price, tierMaxSupply);
        return tokenId;
    }

    // ============================================================================
    // MINTING (with membership checks)
    // ============================================================================

    function mintTicket(
        uint256 tokenId,
        address to,
        uint256 quantity
    ) external payable nonReentrant onlyRole(MINTER_ROLE) tierExists(tokenId) returns (uint256[] memory) {
        require(quantity > 0 && quantity <= maxTicketsPerTransaction, "Invalid quantity");

        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Minting disabled");
        require(tier.minted + quantity <= tier.maxSupply, "Tier sold out");
        require(evt.mintedCount + quantity <= evt.totalSupply, "Event sold out");

        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][to] + quantity <= evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        // ==================== MEMBERSHIP CHECK (V2 addition) ====================
        uint256 communityId = eventToCommunity[eventId];
        uint256 requiredPayment = tier.price * quantity;

        if (communityId != 0) {
            MembershipGate storage gate = eventMembershipGate[eventId];
            bool isMember = isValidMember(communityId, to);
            uint8 memberTier = memberships[communityId][to].tier;

            if (gate.accessMode == 2) {
                require(isMember, "Members only event");
                require(memberTier >= gate.minTierRequired, "Insufficient membership tier");
                requiredPayment = 0;
            } else if (gate.accessMode == 1) {
                if (isMember && memberTier >= gate.minTierRequired) {
                    requiredPayment = 0;
                }
            }
        }

        require(msg.value >= requiredPayment, "Insufficient payment");
        // ========================================================================

        _mint(to, tokenId, quantity, "");

        uint256[] memory ticketIds = _createTicketRecords(
            tokenId, to, quantity, eventId, tier.seatPrefix, tier.price, tier.nextSeatIndex
        );

        tier.minted += quantity;
        tier.nextSeatIndex += quantity;
        evt.mintedCount += quantity;
        eventPurchases[eventId][to] += quantity;

        if (requiredPayment > 0) {
            _distributePayment(evt.organizer, requiredPayment, platformFeePrimary);
        }

        if (msg.value > requiredPayment) {
            (bool refunded, ) = msg.sender.call{value: msg.value - requiredPayment}("");
            require(refunded, "Refund failed");
        }

        return ticketIds;
    }

    function mintTicketWithSeat(
        uint256 tokenId,
        address to,
        string memory seatIdentifier
    ) external payable nonReentrant onlyRole(MINTER_ROLE) tierExists(tokenId) returns (uint256) {
        require(bytes(seatIdentifier).length > 0, "Seat ID required");

        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Minting disabled");
        require(tier.minted < tier.maxSupply, "Tier sold out");
        require(evt.mintedCount < evt.totalSupply, "Event sold out");

        require(
            seatRegistry[eventId][seatIdentifier] == 0 ||
            !ticketInfos[seatRegistry[eventId][seatIdentifier]].exists,
            "Seat taken"
        );

        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][to] < evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        // ==================== MEMBERSHIP CHECK (V2 addition) ====================
        uint256 communityId = eventToCommunity[eventId];
        uint256 requiredPayment = tier.price;

        if (communityId != 0) {
            MembershipGate storage gate = eventMembershipGate[eventId];
            bool isMember = isValidMember(communityId, to);
            uint8 memberTier = memberships[communityId][to].tier;

            if (gate.accessMode == 2) {
                require(isMember, "Members only event");
                require(memberTier >= gate.minTierRequired, "Insufficient membership tier");
                requiredPayment = 0;
            } else if (gate.accessMode == 1) {
                if (isMember && memberTier >= gate.minTierRequired) {
                    requiredPayment = 0;
                }
            }
        }

        require(msg.value >= requiredPayment, "Insufficient payment");
        // ========================================================================

        _mint(to, tokenId, 1, "");

        uint256 ticketId = _ticketIdCounter++;

        ticketInfos[ticketId] = TicketInfo({
            eventId: eventId,
            tierId: tokenId,
            seatIdentifier: seatIdentifier,
            originalPrice: tier.price,
            purchaseTimestamp: block.timestamp,
            originalPurchaser: to,
            currentOwner: to,
            exists: true
        });

        seatRegistry[eventId][seatIdentifier] = ticketId;
        ticketOwners[ticketId] = to;
        _eventTickets[eventId].push(ticketId);
        _userEventTickets[to][eventId].push(ticketId);

        tier.minted++;
        evt.mintedCount++;
        eventPurchases[eventId][to]++;

        emit TicketMinted(ticketId, eventId, tokenId, to, seatIdentifier, tier.price);

        if (requiredPayment > 0) {
            _distributePayment(evt.organizer, requiredPayment, platformFeePrimary);
        }

        if (msg.value > requiredPayment) {
            (bool refunded, ) = msg.sender.call{value: msg.value - requiredPayment}("");
            require(refunded, "Refund failed");
        }

        return ticketId;
    }

    function mintBatch(
        uint256[] calldata tokenIds,
        address[] calldata recipients,
        uint256[] calldata quantities
    ) external payable nonReentrant onlyRole(MINTER_ROLE) {
        require(
            tokenIds.length == recipients.length &&
            recipients.length == quantities.length,
            "Array length mismatch"
        );
        require(tokenIds.length > 0, "Empty arrays");

        uint256 totalRequired = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ticketTiers[tokenIds[i]].exists, "Tier not found");
            totalRequired += ticketTiers[tokenIds[i]].price * quantities[i];
        }

        require(msg.value >= totalRequired, "Insufficient payment");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _mintInternal(tokenIds[i], recipients[i], quantities[i]);
        }

        if (msg.value > totalRequired) {
            (bool refunded, ) = msg.sender.call{value: msg.value - totalRequired}("");
            require(refunded, "Refund failed");
        }
    }

    // ============================================================================
    // TICKET BURNING (from DucketV1)
    // ============================================================================

    function burnTicket(
        uint256 ticketId,
        string calldata reason
    ) external onlyRole(MINTER_ROLE) {
        require(ticketInfos[ticketId].exists, "Ticket not found");

        TicketInfo storage ticket = ticketInfos[ticketId];
        uint256 eventId = ticket.eventId;
        uint256 tierId = ticket.tierId;
        address holder = ticket.currentOwner;

        _burn(holder, tierId, 1);

        _releaseTierSupply(tierId);
        _releaseWalletPurchases(eventId, holder);

        ticket.exists = false;

        emit TicketBurned(ticketId, eventId, holder, reason);
    }

    function burnTicketBatch(
        uint256[] calldata ticketIds,
        string calldata reason
    ) external onlyRole(MINTER_ROLE) {
        for (uint256 i = 0; i < ticketIds.length; i++) {
            uint256 ticketId = ticketIds[i];
            require(ticketInfos[ticketId].exists, "Ticket not found");

            TicketInfo storage ticket = ticketInfos[ticketId];
            uint256 eventId = ticket.eventId;
            uint256 tierId = ticket.tierId;
            address holder = ticket.currentOwner;

            _burn(holder, tierId, 1);

            _releaseTierSupply(tierId);
            _releaseWalletPurchases(eventId, holder);

            ticket.exists = false;

            emit TicketBurned(ticketId, eventId, holder, reason);
        }
    }

    // ============================================================================
    // ON-CHAIN REDEMPTION LOGGING (from DucketV1)
    // ============================================================================

    function logRedemption(
        uint256 ticketId,
        uint256 eventId,
        string calldata perkType
    ) external onlyRole(MINTER_ROLE) {
        require(ticketInfos[ticketId].exists, "Ticket not found");
        emit PerkRedeemed(ticketId, eventId, perkType, block.timestamp);
    }

    function logRedemptionBatch(
        uint256[] calldata ticketIds,
        uint256[] calldata eventIds,
        string[] calldata perkTypes
    ) external onlyRole(MINTER_ROLE) {
        require(
            ticketIds.length == eventIds.length && eventIds.length == perkTypes.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < ticketIds.length; i++) {
            require(ticketInfos[ticketIds[i]].exists, "Ticket not found");
            emit PerkRedeemed(ticketIds[i], eventIds[i], perkTypes[i], block.timestamp);
        }
    }

    // ============================================================================
    // RESALE MARKETPLACE
    // ============================================================================

    function listForResale(uint256 ticketId, uint256 price) external {
        TicketInfo storage ticket = ticketInfos[ticketId];
        require(ticket.exists, "Ticket not found");
        require(ticket.currentOwner == msg.sender, "Not ticket owner");

        EventConfig storage evt = events[ticket.eventId];
        require(evt.resaleEnabled, "Resale disabled");
        require(block.timestamp >= evt.resaleLockUntil, "Resale locked");
        require(!evt.paused && !evt.cancelled && !globalPause, "Event inactive");

        uint256 maxPrice = (ticket.originalPrice * evt.maxResalePercentage) / 100;
        require(price <= maxPrice, "Price exceeds cap");

        require(!resaleListings[ticketId].active, "Already listed");

        require(balanceOf(msg.sender, ticket.tierId) > 0, "Token not owned");

        resaleListings[ticketId] = ResaleListing({
            ticketId: ticketId,
            seller: msg.sender,
            price: price,
            active: true
        });

        emit TicketListedForResale(ticketId, msg.sender, price);
    }

    function buyResaleTicket(uint256 ticketId) external payable nonReentrant {
        ResaleListing storage listing = resaleListings[ticketId];
        require(listing.active, "Not listed");

        TicketInfo storage ticket = ticketInfos[ticketId];
        EventConfig storage evt = events[ticket.eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Event inactive");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        listing.active = false;

        _safeTransferFrom(seller, msg.sender, ticket.tierId, 1, "");

        ticket.currentOwner = msg.sender;
        ticketOwners[ticketId] = msg.sender;
        _userEventTickets[msg.sender][ticket.eventId].push(ticketId);

        _distributePayment(seller, price, platformFeeResale);

        if (msg.value > price) {
            (bool refunded, ) = msg.sender.call{value: msg.value - price}("");
            require(refunded, "Refund failed");
        }

        emit TicketResold(ticketId, seller, msg.sender, price);
    }

    function cancelResaleListing(uint256 ticketId) external {
        ResaleListing storage listing = resaleListings[ticketId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Not active");

        listing.active = false;
        emit ResaleListingCancelled(ticketId);
    }

    // ============================================================================
    // COMMUNITY MANAGEMENT (V2 additions)
    // ============================================================================

    function createCommunity(string memory _name) external returns (uint256) {
        require(bytes(_name).length > 0, "Name required");

        uint256 communityId = nextCommunityId++;

        communities[communityId] = Community({
            name: _name,
            admin: msg.sender,
            exists: true,
            isActive: true
        });

        emit CommunityCreated(communityId, _name, msg.sender);
        return communityId;
    }

    function updateCommunity(
        uint256 communityId,
        string memory _name,
        bool isActive
    ) external communityExists(communityId) onlyCommunityAdmin(communityId) {
        Community storage community = communities[communityId];

        if (bytes(_name).length > 0) {
            community.name = _name;
        }
        community.isActive = isActive;

        emit CommunityUpdated(communityId, community.name, isActive);
    }

    function transferCommunityOwnership(
        uint256 communityId,
        address newAdmin
    ) external communityExists(communityId) onlyCommunityAdmin(communityId) {
        require(newAdmin != address(0), "Invalid address");

        address oldAdmin = communities[communityId].admin;
        communities[communityId].admin = newAdmin;

        emit CommunityOwnershipTransferred(communityId, oldAdmin, newAdmin);
    }

    // ============================================================================
    // MEMBERSHIP MANAGEMENT (V2 additions)
    // ============================================================================

    function grantMembership(
        uint256 communityId,
        address user,
        uint8 tier,
        uint256 expiry
    ) external communityExists(communityId) communityActive(communityId) {
        require(
            communities[communityId].admin == msg.sender ||
            hasRole(MINTER_ROLE, msg.sender),
            "Not authorized"
        );
        require(user != address(0), "Invalid user address");
        require(tier > 0, "Tier must be > 0");

        memberships[communityId][user] = MembershipInfo({
            isActive: true,
            expiry: expiry,
            tier: tier
        });

        emit MembershipGranted(communityId, user, tier, expiry);
    }

    function revokeMembership(
        uint256 communityId,
        address user
    ) external communityExists(communityId) {
        require(
            communities[communityId].admin == msg.sender ||
            hasRole(MINTER_ROLE, msg.sender),
            "Not authorized"
        );

        MembershipInfo storage membership = memberships[communityId][user];
        require(membership.isActive, "No active membership");

        membership.isActive = false;
        membership.tier = 0;

        emit MembershipRevoked(communityId, user);
    }

    function updateMembership(
        uint256 communityId,
        address user,
        uint8 tier,
        uint256 expiry
    ) external communityExists(communityId) {
        require(
            communities[communityId].admin == msg.sender ||
            hasRole(MINTER_ROLE, msg.sender),
            "Not authorized"
        );
        require(tier > 0, "Tier must be > 0");

        MembershipInfo storage membership = memberships[communityId][user];
        require(membership.isActive, "No active membership");

        membership.tier = tier;
        membership.expiry = expiry;

        emit MembershipUpdated(communityId, user, tier, expiry);
    }

    function isValidMember(
        uint256 communityId,
        address user
    ) public view returns (bool) {
        MembershipInfo storage membership = memberships[communityId][user];

        if (!membership.isActive) {
            return false;
        }

        if (membership.expiry != 0 && membership.expiry < block.timestamp) {
            return false;
        }

        return true;
    }

    function getMembership(
        uint256 communityId,
        address user
    ) external view returns (bool isActive, uint8 tier, uint256 expiry) {
        MembershipInfo storage membership = memberships[communityId][user];
        return (membership.isActive, membership.tier, membership.expiry);
    }

    // ============================================================================
    // COMMUNITY EVENTS (V2 additions)
    // ============================================================================

    function createCommunityEvent(
        uint256 communityId,
        string memory _name,
        uint256 eventDate,
        uint16 maxResalePercentage,
        uint8 accessMode,
        uint8 minTierRequired
    ) external communityExists(communityId) onlyCommunityAdmin(communityId) communityActive(communityId) returns (uint256) {
        require(accessMode <= 2, "Invalid access mode");
        require(bytes(_name).length > 0, "Name required");
        require(eventDate > block.timestamp, "Event must be in future");
        require(maxResalePercentage >= 100 && maxResalePercentage <= 200, "Resale % must be 100-200");

        uint256 eventId = _eventIdCounter++;

        events[eventId] = EventConfig({
            organizer: msg.sender,
            maxResalePercentage: maxResalePercentage,
            resaleEnabled: true,
            transferEnabled: true,
            paused: false,
            cancelled: false,
            exists: true,
            name: _name,
            eventDate: eventDate,
            maxTicketsPerWallet: 0,
            totalSupply: maxEventSupply,
            mintedCount: 0,
            resaleLockUntil: 0,
            createdAt: block.timestamp
        });

        eventToCommunity[eventId] = communityId;

        eventMembershipGate[eventId] = MembershipGate({
            accessMode: accessMode,
            minTierRequired: minTierRequired
        });

        emit EventCreated(eventId, _name, msg.sender, maxEventSupply);
        emit EventLinkedToCommunity(eventId, communityId, accessMode);

        return eventId;
    }

    function linkEventToCommunity(
        uint256 eventId,
        uint256 communityId,
        uint8 accessMode,
        uint8 minTierRequired
    ) external eventExists(eventId) communityExists(communityId) onlyCommunityAdmin(communityId) {
        require(events[eventId].organizer == msg.sender, "Not event organizer");
        require(eventToCommunity[eventId] == 0, "Event already linked");
        require(accessMode <= 2, "Invalid access mode");

        eventToCommunity[eventId] = communityId;
        eventMembershipGate[eventId] = MembershipGate({
            accessMode: accessMode,
            minTierRequired: minTierRequired
        });

        emit EventLinkedToCommunity(eventId, communityId, accessMode);
    }

    function updateEventMembershipGate(
        uint256 eventId,
        uint8 accessMode,
        uint8 minTierRequired
    ) external eventExists(eventId) {
        uint256 communityId = eventToCommunity[eventId];
        require(communityId != 0, "Event not linked to community");
        require(communities[communityId].admin == msg.sender, "Not community admin");
        require(accessMode <= 2, "Invalid access mode");

        eventMembershipGate[eventId] = MembershipGate({
            accessMode: accessMode,
            minTierRequired: minTierRequired
        });

        emit EventMembershipGateUpdated(eventId, accessMode, minTierRequired);
    }

    // ============================================================================
    // QUERY FUNCTIONS
    // ============================================================================

    function getEventTickets(uint256 eventId) external view returns (uint256[] memory) {
        return _eventTickets[eventId];
    }

    function getUserTicketsForEvent(address user, uint256 eventId)
        external view returns (uint256[] memory)
    {
        return _userEventTickets[user][eventId];
    }

    function getRemainingAllowance(uint256 eventId, address user)
        external view returns (uint256)
    {
        EventConfig storage evt = events[eventId];
        if (evt.maxTicketsPerWallet == 0) {
            return type(uint256).max;
        }
        uint256 purchased = eventPurchases[eventId][user];
        if (purchased >= evt.maxTicketsPerWallet) {
            return 0;
        }
        return evt.maxTicketsPerWallet - purchased;
    }

    function isSeatAvailable(uint256 eventId, string memory seatIdentifier)
        external view returns (bool)
    {
        uint256 existingTicketId = seatRegistry[eventId][seatIdentifier];
        return existingTicketId == 0 || !ticketInfos[existingTicketId].exists;
    }

    function getEvent(uint256 eventId) external view returns (EventConfig memory) {
        require(events[eventId].exists, "Event not found");
        return events[eventId];
    }

    function getTicketTier(uint256 tokenId) external view returns (TicketTier memory) {
        require(ticketTiers[tokenId].exists, "Tier not found");
        return ticketTiers[tokenId];
    }

    function getTicketInfo(uint256 ticketId) external view returns (TicketInfo memory) {
        require(ticketInfos[ticketId].exists, "Ticket not found");
        return ticketInfos[ticketId];
    }

    function getCommunity(uint256 communityId) external view communityExists(communityId) returns (
        string memory _name,
        address admin,
        bool isActive
    ) {
        Community storage community = communities[communityId];
        return (community.name, community.admin, community.isActive);
    }

    function getEventCommunityInfo(uint256 eventId) external view returns (
        uint256 communityId,
        uint8 accessMode,
        uint8 minTierRequired
    ) {
        communityId = eventToCommunity[eventId];
        if (communityId != 0) {
            MembershipGate storage gate = eventMembershipGate[eventId];
            return (communityId, gate.accessMode, gate.minTierRequired);
        }
        return (0, 0, 0);
    }

    function checkEventAccess(uint256 eventId, address user) external view returns (
        bool canAccess,
        bool isFree
    ) {
        uint256 communityId = eventToCommunity[eventId];

        if (communityId == 0) {
            return (true, false);
        }

        MembershipGate storage gate = eventMembershipGate[eventId];
        bool isMember = isValidMember(communityId, user);
        uint8 memberTier = memberships[communityId][user].tier;
        bool hasRequiredTier = memberTier >= gate.minTierRequired;

        if (gate.accessMode == 0) {
            return (true, false);
        }

        if (gate.accessMode == 1) {
            if (isMember && hasRequiredTier) {
                return (true, true);
            }
            return (true, false);
        }

        if (gate.accessMode == 2) {
            if (isMember && hasRequiredTier) {
                return (true, true);
            }
            return (false, false);
        }

        return (false, false);
    }

    // ============================================================================
    // PLATFORM ADMIN FUNCTIONS
    // ============================================================================

    function setPlatformFees(uint256 primaryFee, uint256 resaleFee)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(primaryFee <= 1000 && resaleFee <= 1000, "Fee too high");
        platformFeePrimary = primaryFee;
        platformFeeResale = resaleFee;
    }

    function setPlatformWallet(address wallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(wallet != address(0), "Invalid address");
        platformWallet = wallet;
    }

    function setOrganizerVerified(address organizer, bool verified)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        verifiedOrganizers[organizer] = verified;
        emit OrganizerVerified(organizer, verified);
    }

    function setGlobalPause(bool paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        globalPause = paused;
        emit GlobalPauseSet(paused);
    }

    function setPlatformLimits(uint256 _maxEventSupply, uint256 _maxTicketsPerTx)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        maxEventSupply = _maxEventSupply;
        maxTicketsPerTransaction = _maxTicketsPerTx;
    }

    // ============================================================================
    // INTERNAL FUNCTIONS
    // ============================================================================

    function _generateSeatId(string memory prefix, uint256 number)
        internal pure returns (string memory)
    {
        return string(abi.encodePacked(prefix, _padNumber(number, 4)));
    }

    function _padNumber(uint256 number, uint256 width)
        internal pure returns (string memory)
    {
        bytes memory buffer = new bytes(width);
        for (uint256 i = width; i > 0; i--) {
            buffer[i - 1] = bytes1(uint8(48 + (number % 10)));
            number /= 10;
        }
        return string(buffer);
    }

    function _distributePayment(address recipient, uint256 amount, uint256 feeRate) internal {
        uint256 fee = (amount * feeRate) / 10000;
        uint256 recipientAmount = amount - fee;

        if (fee > 0) {
            (bool sentFee, ) = platformWallet.call{value: fee}("");
            require(sentFee, "Platform fee failed");
        }

        if (recipientAmount > 0) {
            (bool sentRecipient, ) = recipient.call{value: recipientAmount}("");
            require(sentRecipient, "Payment failed");
        }
    }

    function _createTicketRecords(
        uint256 tokenId,
        address to,
        uint256 quantity,
        uint256 eventId,
        string memory seatPrefix,
        uint256 price,
        uint256 startingMintIndex
    ) internal returns (uint256[] memory) {
        uint256[] memory ticketIds = new uint256[](quantity);

        for (uint256 i = 0; i < quantity; i++) {
            uint256 ticketId = _ticketIdCounter++;
            string memory seatId = _generateSeatId(seatPrefix, startingMintIndex + i);

            require(
                seatRegistry[eventId][seatId] == 0 ||
                !ticketInfos[seatRegistry[eventId][seatId]].exists,
                "Seat taken"
            );

            _storeTicketInfo(ticketId, eventId, tokenId, seatId, price, to);
            ticketIds[i] = ticketId;

            emit TicketMinted(ticketId, eventId, tokenId, to, seatId, price);
        }

        return ticketIds;
    }

    function _storeTicketInfo(
        uint256 ticketId,
        uint256 eventId,
        uint256 tokenId,
        string memory seatId,
        uint256 price,
        address to
    ) internal {
        ticketInfos[ticketId] = TicketInfo({
            eventId: eventId,
            tierId: tokenId,
            seatIdentifier: seatId,
            originalPrice: price,
            purchaseTimestamp: block.timestamp,
            originalPurchaser: to,
            currentOwner: to,
            exists: true
        });

        seatRegistry[eventId][seatId] = ticketId;
        ticketOwners[ticketId] = to;
        _eventTickets[eventId].push(ticketId);
        _userEventTickets[to][eventId].push(ticketId);
    }

    function _mintInternal(uint256 tokenId, address to, uint256 quantity) internal {
        TicketTier storage tier = ticketTiers[tokenId];
        uint256 eventId = tier.eventId;
        EventConfig storage evt = events[eventId];

        require(!evt.paused && !evt.cancelled && !globalPause, "Minting disabled");
        require(tier.minted + quantity <= tier.maxSupply, "Tier sold out");
        require(evt.mintedCount + quantity <= evt.totalSupply, "Event sold out");

        if (evt.maxTicketsPerWallet > 0) {
            require(
                eventPurchases[eventId][to] + quantity <= evt.maxTicketsPerWallet,
                "Wallet limit exceeded"
            );
        }

        _mint(to, tokenId, quantity, "");

        _createTicketRecords(
            tokenId, to, quantity, eventId, tier.seatPrefix, tier.price, tier.nextSeatIndex
        );

        tier.minted += quantity;
        tier.nextSeatIndex += quantity;
        evt.mintedCount += quantity;
        eventPurchases[eventId][to] += quantity;

        _distributePayment(evt.organizer, tier.price * quantity, platformFeePrimary);
    }

    function _releaseTierSupply(uint256 tierId) internal {
        TicketTier storage tier = ticketTiers[tierId];
        require(tier.minted >= 1, "Cannot release more than minted");

        tier.minted -= 1;

        EventConfig storage evt = events[tier.eventId];
        if (evt.mintedCount >= 1) {
            evt.mintedCount -= 1;
        }

        emit TierSupplyReleased(tierId, 1);
    }

    function _releaseWalletPurchases(uint256 eventId, address wallet) internal {
        if (eventPurchases[eventId][wallet] >= 1) {
            eventPurchases[eventId][wallet] -= 1;
            emit WalletPurchasesReleased(eventId, wallet, 1);
        }
    }

    // ============================================================================
    // OVERRIDES
    // ============================================================================

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
                    EventConfig storage evt = events[eventId];

                    require(evt.transferEnabled || evt.resaleEnabled, "Transfers disabled");
                }
            }
        }

        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
