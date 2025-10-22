// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title 学籍链证书管理合约
 * @notice 管理院校注册与学生证书的签发、撤销与验证。
 * @dev 仅存储证书必要信息与文档哈希，详细数据建议放链下（如 IPFS）。
 */
contract AcademicLedger is AccessControl, Pausable {
    using Strings for uint256;

    // 角色：院校可签发与撤销证书
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    // 证书结构
    struct Certificate {
        // 主键 ID（自增计数器）
        uint256 id;
        // 学生标识（地址或 DID 哈希；此处用地址作为示例）
        address student;
        // 签发院校地址（拥有 INSTITUTION_ROLE）
        address institution;
        // 项目/专业名称（如 "Computer Science"）
        string program;
        // 学位层级（如 "Bachelor", "Master"）
        string level;
        // 证书签发时间戳（秒）
        uint64 issuedAt;
        // 证书过期时间戳（可为 0 表示永久有效）
        uint64 expiresAt;
        // 链下详情链接（IPFS/HTTPS）
        string uri;
        // 文档哈希（如 PDF/JSON 的 keccak256 或其他算法结果）
        bytes32 docHash;
        // 是否被撤销
        bool revoked;
    }

    // 院校元数据
    struct Institution {
        string name;
        string metadataURI; // 可选：院校资料（备案号、认证文件等）
        bool active;
    }

    // 证书存储
    uint256 private _nextId = 1;
    mapping(uint256 => Certificate) private _certs;
    // 学生地址 -> 证书 ID 列表（便于查询）
    mapping(address => uint256[]) private _byStudent;
    // 院校地址 -> 证书 ID 列表
    mapping(address => uint256[]) private _byInstitution;

    // 院校注册表
    mapping(address => Institution) public institutions;

    // 事件
    event InstitutionRegistered(address indexed institution, string name, string metadataURI);
    event InstitutionStatusChanged(address indexed institution, bool active);
    event CertificateIssued(
        uint256 indexed id,
        address indexed student,
        address indexed institution,
        bytes32 docHash
    );
    event CertificateRevoked(uint256 indexed id, address indexed institution, string reason);
    event CertificateUriUpdated(uint256 indexed id, string newUri);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // ---------------------------
    // 管理与权限
    // ---------------------------

    /**
     * @notice 注册院校并授予 INSTITUTION_ROLE。
     */
    function registerInstitution(
        address institutionAddr,
        string calldata name,
        string calldata metadataURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        require(institutionAddr != address(0), "Invalid address");
        institutions[institutionAddr] = Institution({name: name, metadataURI: metadataURI, active: true});
        _grantRole(INSTITUTION_ROLE, institutionAddr);
        emit InstitutionRegistered(institutionAddr, name, metadataURI);
    }

    /**
     * @notice 设置院校启用/停用（停用后不可再签发/撤销证书）。
     */
    function setInstitutionStatus(address institutionAddr, bool active)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(institutions[institutionAddr].active != active, "No change");
        institutions[institutionAddr].active = active;
        emit InstitutionStatusChanged(institutionAddr, active);
    }

    /**
     * @notice 暂停合约（紧急制动）。
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice 恢复合约。
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ---------------------------
    // 证书签发与维护
    // ---------------------------

    /**
     * @notice 签发单份证书。
     * @param student 学生地址
     * @param program 专业/项目名称
     * @param level 学位层级
     * @param expiresAt 到期时间（0 表示永久有效）
     * @param uri 链下详情链接
     * @param docHash 文档哈希（建议链下原文 keccak256）
     */
    function issueCertificate(
        address student,
        string calldata program,
        string calldata level,
        uint64 expiresAt,
        string calldata uri,
        bytes32 docHash
    ) external onlyRole(INSTITUTION_ROLE) whenNotPaused returns (uint256 id) {
        require(institutions[_msgSender()].active, "Institution inactive");
        require(student != address(0), "Invalid student");
        require(docHash != bytes32(0), "Doc hash required");

        id = _nextId++;
        Certificate memory c = Certificate({
            id: id,
            student: student,
            institution: _msgSender(),
            program: program,
            level: level,
            issuedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            uri: uri,
            docHash: docHash,
            revoked: false
        });
        _certs[id] = c;
        _byStudent[student].push(id);
        _byInstitution[_msgSender()].push(id);

        emit CertificateIssued(id, student, _msgSender(), docHash);
    }

    /**
     * @notice 批量签发证书（与单发参数同构）。
     */
    // function batchIssueCertificates(
    //     address[] calldata students,
    //     string[] calldata programs,
    //     string[] calldata levels,
    //     uint64[] calldata expires,
    //     string[] calldata uris,
    //     bytes32[] calldata docHashes
    // ) external onlyRole(INSTITUTION_ROLE) whenNotPaused returns (uint256[] memory ids) {
    //     require(institutions[_msgSender()].active, "Institution inactive");
    //     uint256 len = students.length;
    //     require(
    //         len == programs.length &&
    //         len == levels.length &&
    //         len == expires.length &&
    //         len == uris.length &&
    //         len == docHashes.length,
    //         "Length mismatch"
    //     );
    //     ids = new uint256[](len);
    //     for (uint256 i = 0; i < len; i++) {
    //         require(students[i] != address(0), "Invalid student");
    //         require(docHashes[i] != bytes32(0), "Doc hash required");
    //         uint256 id = _nextId++;
    //         Certificate memory c = Certificate({
    //             id: id,
    //             student: students[i],
    //             institution: _msgSender(),
    //             program: programs[i],
    //             level: levels[i],
    //             issuedAt: uint64(block.timestamp),
    //             expiresAt: expires[i],
    //             uri: uris[i],
    //             docHash: docHashes[i],
    //             revoked: false
    //         });
    //         _certs[id] = c;
    //         _byStudent[students[i]].push(id);
    //         _byInstitution[_msgSender()].push(id);
    //         ids[i] = id;

    //         emit CertificateIssued(id, students[i], _msgSender(), docHashes[i]);
    //     }
    // }

    /**
     * @notice 撤销证书（仅签发院校）。
     */
    function revokeCertificate(uint256 id, string calldata reason)
        external
        onlyRole(INSTITUTION_ROLE)
        whenNotPaused
    {
        Certificate storage c = _certs[id];
        require(c.id == id, "Not found");
        require(c.institution == _msgSender(), "Not issuer");
        require(!c.revoked, "Already revoked");
        c.revoked = true;
        emit CertificateRevoked(id, _msgSender(), reason);
    }

    /**
     * @notice 更新证书的链下 URI（仅签发院校）。
     */
    function updateCertificateUri(uint256 id, string calldata newUri)
        external
        onlyRole(INSTITUTION_ROLE)
        whenNotPaused
    {
        Certificate storage c = _certs[id];
        require(c.id == id, "Not found");
        require(c.institution == _msgSender(), "Not issuer");
        _certs[id].uri = newUri;
        emit CertificateUriUpdated(id, newUri);
    }

    // ---------------------------
    // 查询与验证
    // ---------------------------

    /**
     * @notice 获取证书详情。
     */
    function getCertificate(uint256 id) external view returns (Certificate memory) {
        Certificate memory c = _certs[id];
        require(c.id == id, "Not found");
        return c;
    }

    /**
     * @notice 查询某学生的所有证书 ID。
     */
    function certificatesOf(address student) external view returns (uint256[] memory) {
        return _byStudent[student];
    }

    /**
     * @notice 查询某院校签发的所有证书 ID。
     */
    function certificatesByInstitution(address institutionAddr) external view returns (uint256[] memory) {
        return _byInstitution[institutionAddr];
    }

    /**
     * @notice 验证证书是否有效（未撤销、未过期、院校仍有效）。
     * @dev 可在前端同时核对链下文档哈希与机构数据。
     */
    function verifyValidity(uint256 id) external view returns (bool valid, string memory reason) {
        Certificate memory c = _certs[id];
        if (c.id != id) return (false, "Not found");
        if (!institutions[c.institution].active) return (false, "Institution inactive");
        if (c.revoked) return (false, "Revoked");
        if (c.expiresAt != 0 && block.timestamp > c.expiresAt) return (false, "Expired");
        return (true, "");
    }
}
