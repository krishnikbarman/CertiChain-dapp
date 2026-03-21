// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertiChain
 * @dev Certificate storage and verification on blockchain
 */
contract CertiChain {
    // Certificate structure
    struct Certificate {
        string studentName;
        string courseName;
        uint256 issueDate;
        bool exists;
    }

    // Admin address
    address public admin;

    // Mapping for certificate storage by hash
    mapping(string => Certificate) public certificates;

    // Mapping to check if certificate exists
    mapping(string => bool) public certificateExists;

    // Array to store all certificate hashes (NEW)
    string[] public allHashes;

    // Constructor
    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Add a new certificate
     * @param _hash Certificate hash
     * @param _studentName Student name
     * @param _courseName Course name
     * @param _issueDate Issue date (Unix timestamp)
     */
    function addCertificate(
        string memory _hash,
        string memory _studentName,
        string memory _courseName,
        uint256 _issueDate
    ) public {
        require(msg.sender == admin, "Only admin can add certificates");
        require(!certificateExists[_hash], "Certificate already exists");
        require(bytes(_hash).length > 0, "Hash cannot be empty");

        // Store certificate
        certificates[_hash] = Certificate(
            _studentName,
            _courseName,
            _issueDate,
            true
        );

        certificateExists[_hash] = true;

        // Add hash to array (NEW)
        allHashes.push(_hash);
    }

    /**
     * @dev Verify a certificate by hash
     * @param _hash Certificate hash
     * @return exists Boolean indicating if certificate exists
     * @return studentName Student name
     * @return courseName Course name
     * @return issueDate Issue date
     */
    function verifyCertificate(string memory _hash)
        public
        view
        returns (
            bool exists,
            string memory studentName,
            string memory courseName,
            uint256 issueDate
        )
    {
        Certificate memory cert = certificates[_hash];
        return (
            cert.exists,
            cert.studentName,
            cert.courseName,
            cert.issueDate
        );
    }

    /**
     * @dev Get all certificate hashes (NEW)
     * @return Array of all certificate hashes
     */
    function getAllHashes() public view returns (string[] memory) {
        return allHashes;
    }

    /**
     * @dev Get total number of certificates (NEW)
     * @return Total count of certificates
     */
    function getCertificateCount() public view returns (uint256) {
        return allHashes.length;
    }
}
