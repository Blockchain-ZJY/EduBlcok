// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title 学籍链证书管理合约
 * @notice 管理院校注册与学生证书的签发。
 * @dev 仅存储证书必要信息与文档哈希，详细数据建议放链下（如 IPFS）。
 */
contract AcademicLedger is AccessControl, Pausable {
    using Strings for uint256;

    // 角色：院校可签发证书
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
    }

    // 院校元数据
    struct Institution {
        string name;
        string metadataURI; // 可选：院校资料（备案号、认证文件等）
    }

    // 学生元数据
    struct Student {
        string name;
        string studentId; // 学号
        string metadataURI; // 可选：学生资料
        bool active;
        uint256 registeredAt; // 注册时间戳
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
    
    // 学生注册表
    mapping(address => Student) public students;

    // 事件
    event InstitutionRegistered(address indexed institution, string name, string metadataURI);
    event StudentRegistered(address indexed student, string name, string studentId);
    event StudentStatusChanged(address indexed student, bool active);
    event CertificateIssued(
        uint256 indexed id,
        address indexed student,
        address indexed institution,
        bytes32 docHash
    );
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
        institutions[institutionAddr] = Institution({name: name, metadataURI: metadataURI});
        _grantRole(INSTITUTION_ROLE, institutionAddr);
        emit InstitutionRegistered(institutionAddr, name, metadataURI);
    }


    /**
     * @notice 注册学生。
     */
    function registerStudent(
        address studentAddr,
        string calldata name,
        string calldata studentId,
        string calldata metadataURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) whenNotPaused {
        require(studentAddr != address(0), "Invalid address");
        require(bytes(name).length > 0, "Name required");
        require(bytes(studentId).length > 0, "Student ID required");
        
        students[studentAddr] = Student({
            name: name,
            studentId: studentId,
            metadataURI: metadataURI,
            active: true,
            registeredAt: block.timestamp
        });
        
        emit StudentRegistered(studentAddr, name, studentId);
    }

    /**
     * @notice 设置学生启用/停用。
     */
    function setStudentStatus(address studentAddr, bool active)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(students[studentAddr].active != active, "No change");
        students[studentAddr].active = active;
        emit StudentStatusChanged(studentAddr, active);
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
            docHash: docHash
        });
        _certs[id] = c;
        _byStudent[student].push(id);
        _byInstitution[_msgSender()].push(id);

        emit CertificateIssued(id, student, _msgSender(), docHash);
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
    // 查询
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
     * @notice 获取学生详细信息
     */
    function getStudent(address studentAddr) external view returns (
        string memory name,
        string memory studentId,
        string memory metadataURI,
        bool active,
        uint256 registeredAt
    ) {
        Student memory s = students[studentAddr];
        return (s.name, s.studentId, s.metadataURI, s.active, s.registeredAt);
    }

    /**
     * @notice 获取院校详细信息
     */
    function getInstitution(address institutionAddr) external view returns (
        string memory name,
        string memory metadataURI
    ) {
        Institution memory inst = institutions[institutionAddr];
        return (inst.name, inst.metadataURI);
    }

}
