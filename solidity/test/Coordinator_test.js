import {
  assertActionThrows,
  bigNum,
  calculateSAID,
  consumer,
  checkPublicABI,
  checkServiceAgreementPresent,
  checkServiceAgreementAbsent,
  deploy,
  executeServiceAgreementBytes,
  functionSelector,
  initiateServiceAgreement,
  newAddress,
  newHash,
  oracleNode,
  pad0xHexTo256Bit,
  padHexTo256Bit,
  padNumTo256Bit,
  personalSign,
  recoverPersonalSignature,
  stranger,
  strip0x,
  toHex,
  toWei
} from './support/helpers'
import { assertBigNum } from './support/matchers'

contract('Coordinator', () => {
  const sourcePath = 'Coordinator.sol'
  let coordinator, link

  beforeEach(async () => {
    link = await deploy('link_token/contracts/LinkToken.sol')
    coordinator = await deploy(sourcePath, link.address)
  })

  it('has a limited public interface', () => {
    checkPublicABI(artifacts.require(sourcePath), [
      'getPackedArguments',
      'getId',
      'executeServiceAgreement',
      'initiateServiceAgreement',
      'onTokenTransfer',
      'serviceAgreements'
    ])
  })

  // Service expiry time ("endAt") in integer seconds since the epoch
  const sixMonthsFromNow =
        Math.round(Date.now() / 1000.) + 6 * 31 * 24 * 60 * 60

  const args = [1, 2, sixMonthsFromNow,  // Payment, expiration, endAt
                ['0x70AEc4B9CFFA7b55C0711b82DD719049d615E21d',
                 '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'],  // Oracles
                // Request digest
                '0x85820c5ec619a1f517ee6cfeff545ec0ca1a90206e1a38c47f016d4137e801dd'
               ]

  const expectedBinaryArgs = [  // Convert args to serialized hexadecimal
    '0x',
    ...args.slice(0, 3).map(padNumTo256Bit),  // Payment, expiration, endAt
    ...args[3].map(pad0xHexTo256Bit),  // Oracles
    strip0x(args[4])  // Request digest
  ].join('').toLowerCase()

  const expectedBinaryArgsSha3 = web3.sha3(
    expectedBinaryArgs, { encoding : 'hex' })

  describe('#getPackedArguments', () => {
    it('returns the following value, given these arguments', async() => {
      let result = await coordinator.getPackedArguments.call(...args);
      assert.equal(result, expectedBinaryArgs);
    })
  })

  describe('#getId', () => {
    it('matches the ID generated by the oracle off-chain', async () => {
      let result = await coordinator.getId.call(...args);
      assert.equal(result, expectedBinaryArgsSha3)
    })
  })

  describe('#initiateServiceAgreement', () => {
    const oracle = newAddress(oracleNode)
    const unsignedDefaultServiceAgreement = {
      payment : newHash('1000000000000000000'),
      expiration : newHash('300'),
      endAt : newHash(sixMonthsFromNow.toString()),
      oracles : [oracle],
      requestDigest : newHash(
        '0x9ebed6ae16d275059bf4de0e01482b0eca7ffc0ffcc1918db61e17ac0f7dedc8')
    }
    const serviceAgreementID = calculateSAID(unsignedDefaultServiceAgreement)
    const oracleSignature = personalSign(oracle, serviceAgreementID)
    const requestDigestAddr =
          recoverPersonalSignature(serviceAgreementID, oracleSignature)
    assert.equal(toHex(oracle), toHex(requestDigestAddr))
    const defaultArgs = Object.assign(
      unsignedDefaultServiceAgreement, { oracleSignature })
    context("with valid oracle signatures", () => {
      it('saves a service agreement struct from the parameters', async () => {
        initiateServiceAgreement(coordinator, defaultArgs)
        checkServiceAgreementPresent(coordinator, serviceAgreementID, defaultArgs)
      })
    })

    context("with an invalid oracle signatures", () => {
      const badOracleSignature =
            personalSign(newAddress(stranger), serviceAgreementID)
      const badRequestDigestAddr =
            recoverPersonalSignature(serviceAgreementID, badOracleSignature)
      assert.notEqual(toHex(oracle), toHex(badRequestDigestAddr))
      it('saves no service agreement struct, if signatures invalid', async () => {
        assertActionThrows(
          async () =>
            initiateServiceAgreement(
              coordinator,
              Object.assign(defaultArgs, { oracleSignature: badOracleSignature})))
        checkServiceAgreementAbsent(coordinator, serviceAgreementID)
      })
    })
    context("Validation of service agreement deadlines", () => {
      it('Rejects a service agreement with an endAt date in the past', async () => {
        assertActionThrows(
          async () => initiateServiceAgreement(
            coordinator,
            Object.assign(defaultArgs, { endAt: newHash('1000')})))
        checkServiceAgreementAbsent(coordinator, serviceAgreementID)
      })
    })
  })

  describe('#executeServiceAgreement', () => {
    let tx, log
    const fHash = functionSelector('requestedBytes32(bytes32,bytes32)')
    const to = '0x80e29acb842498fe6591f020bd82766dce619d43'
    const payment = 1000000000000000000
    const requestDigest = newHash('0x9ebed6ae16d275059bf4de0e01482b0eca7ffc0ffcc1918db61e17ac0f7dedc8')
    const oracle = newAddress(oracleNode)
    const unsignedArgs = { payment: newHash(payment.toString()),
                           expiration: newHash('300'),
                           endAt: newHash(sixMonthsFromNow.toString()),
                           oracles: [oracle],
                           requestDigest }

    const sAID = calculateSAID(unsignedArgs)
    const oracleSignature = personalSign(oracle, sAID)
    const signedArgs = Object.assign(unsignedArgs, { oracleSignature })

    beforeEach(async () => {
      if (signedArgs === undefined) { throw Error('what???') }
      await initiateServiceAgreement(coordinator, signedArgs)
      await link.transfer(consumer, toWei(1000))
    })

    context('when called through the LINK token with enough payment', () => {
      console.log('arguments', toHex(sAID), to, fHash, '1', '')
      const payload = executeServiceAgreementBytes(toHex(sAID), to, fHash, '1', '')
      console.log('payload = ', payload)
      beforeEach(async () => {
        // XXX: Something is not coming through, here. Which one?
        tx = await link.transferAndCall(coordinator.address, payment, payload, {
          from: consumer
        })
        log = tx.receipt.logs[2]
      })

      it('logs an event', async () => {
        assert.equal(coordinator.address, log.address)

        // If updating this test, be sure to update services.RunLogTopic.
        let eventSignature = '0x6d6db1f8fe19d95b1d0fa6a4bce7bb24fbf84597b35a33ff95521fac453c1529'
        assert.equal(eventSignature, log.topics[0])

        assert.equal(toHex(sAID), log.topics[1])
        assert.equal(consumer, web3.toDecimal(log.topics[2]))
        assert.equal(payment, web3.toDecimal(log.topics[3]))
      })
    })

    context('when called through the LINK token with not enough payment', () => {
      it('throws an error', async () => {
        const calldata = executeServiceAgreementBytes(toHex(sAID), to, fHash, '1', '')
        const underPaid = bigNum(payment).sub(1)

        await assertActionThrows(async () => {
          tx = await link.transferAndCall(coordinator.address, underPaid, calldata, {
            from: consumer
          })
        })
      })
    })

    context('when not called through the LINK token', () => {
      it('reverts', async () => {
        await assertActionThrows(async () => {
          await coordinator.executeServiceAgreement(0, 0, 1, toHex(sAID), to, fHash, 'id', '', {from: consumer})
        })
      })
    })
  })
})
