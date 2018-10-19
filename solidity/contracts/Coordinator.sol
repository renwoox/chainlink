pragma solidity ^0.4.24;

// Coordinator handles oracle service aggreements between one or more oracles.
contract Coordinator {

  struct ServiceAgreement {
    uint256 payment;
    uint256 expiration;
    uint256 endAt;
    address[] oracles;
    bytes32 requestDigest;
  }

  uint256 oneDay = 24 * 60 * 60;
  uint256 oneYear = 365 * oneDay;

  mapping(bytes32 => ServiceAgreement) public serviceAgreements;

  function getPackedArguments(
    uint256 _payment,
    uint256 _expiration,
    uint256 _endAt,
    address[] _oracles,
    bytes32 _requestDigest
  )
    public pure returns (bytes)
  {
    return abi.encodePacked(_payment, _expiration, _endAt, _oracles, _requestDigest);
  }

  function getId(
    uint256 _payment,
    uint256 _expiration,
    uint256 _endAt,
    address[] _oracles,
    bytes32 _requestDigest
  )
    public pure returns (bytes32)
  {
    return keccak256(getPackedArguments(_payment, _expiration, _endAt, _oracles, _requestDigest));
  }

  function initiateServiceAgreement(
    uint256 _payment,
    uint256 _expiration,
    uint256 _endAt,
    address[] _oracles,
    uint8[] _vs,
    bytes32[] _rs,
    bytes32[] _ss,
    bytes32 _requestDigest
  ) public
  {
    require(_oracles.length == _vs.length && _vs.length == _rs.length && _rs.length == _ss.length, "Must pass in as many signatures as oracles");

    bytes32 serviceAgreementID = getId(_payment, _expiration, _endAt, _oracles, _requestDigest);

    require(_endAt > block.timestamp + oneDay, "ServiceAgreement must run for at least one day");
    require(_endAt < block.timestamp + oneYear, "ServiceAgreement can run for at most one year");

    for (uint i = 0; i < _oracles.length; i++) {
      address signer = getOracleAddressFromSASignature(serviceAgreementID, _vs[i], _rs[i], _ss[i]);
      require(_oracles[i] == signer, "Invalid oracle signature specified in SA");
    }

    serviceAgreements[serviceAgreementID] = ServiceAgreement(
      _payment,
      _expiration,
      _endAt,
      _oracles,
      _requestDigest
    );
  }

  function getOracleAddressFromSASignature(
    bytes32 _serviceAgreementID,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  )
    private pure returns (address)
  {
    bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _serviceAgreementID));
    return ecrecover(prefixedHash, _v, _r, _s);
  }
}
