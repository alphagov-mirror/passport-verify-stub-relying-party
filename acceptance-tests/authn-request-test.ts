const Browser = require('zombie')
import { Server } from 'http'
import { createApp } from './../src/app'
import * as request from 'request-promise-native'
import { assert } from 'chai'
import { parse as parseUrl } from 'url'

describe('Clicking "Start"', function () {

  const browser = new Browser()
  const VERIFY_SERVICE_PROVIDER_HOST = process.env['VERIFY_SERVICE_PROVIDER_HOST'] || 'http://localhost:50400'
  const COMPLIANCE_TOOL_HOST = 'https://compliance-tool-reference.ida.digital.cabinet-office.gov.uk'
  let server: Server

  beforeEach(done => {
    server = createApp({ verifyServiceProviderHost: VERIFY_SERVICE_PROVIDER_HOST }).listen(0, done)
  })

  afterEach(done => {
    server.close(done)
  })

  before(() => {
    const postData = {
      serviceEntityId: 'http://verify-service-provider-dev-service',
      assertionConsumerServiceUrl: 'http://passport-verify-stub-relying-party/verify/response',
      signingCertificate: 'MIIC0jCCAboCCQDx9/z+IdVV6DANBgkqhkiG9w0BAQsFADAqMSgwJgYDVQQDEx9WZXJpZnkgU2VydmljZSBQcm92aWRlciBTaWduaW5nMCAXDTE3MDgxMDE1NTUwN1oYDzIxMTcwNzE3MTU1NTA3WjAqMSgwJgYDVQQDEx9WZXJpZnkgU2VydmljZSBQcm92aWRlciBTaWduaW5nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvSaDKeyxVC+llVxgvifUGfBi0BQF24Un7Js/mtLt6DSfTtiNtLwkbJLb/Y1hEZtZee5jz5WpE+N3fGL3CFF1wy+ezVPOSEMcP5AJ376dJ4QkMglaDVNE49QHxM58dLdRdbSY/CwGTcyR8ZDOHC6scdgdPjDoM3EhyA79EaNycalxLQv9m01YgAjCzaE+afvO51l8A6wxDoadMZG68Paz9k4PmJyg/zcv3VrsvTL5wMs9qX1UW1F7YQLTEEVLkS04oGIsxWEFhtTDv2Vsif7W2NJLqTjoKrTLKHn7N+aEMGMskJVc7gFFm0EwTKkIt/PrE1BXW7f9iNMvBs39PnkkyQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQC47LMMcGr2QXtJlyQsKZGX4SsSzdpVr/1Y5V1soeeRO39jKiYH12z1lh+8OlHF/NcbawEAKZnqkYS0Ka1mE5uKlDmwZ5GtCPYSmD/UVu54zdfrEMhsh7jTM0iong69wx8SfEat7XCt999EFEcIj4OC31X93JX6O0nNx17lzJP+W0jMX8GJSlFeNIYX2r8F83PimC9et949KyEBP0vakqp65Fg1bO9NNlIB17jR4C4OypLD+5gDxshMq9xngqithCNqPpByuS7mmJ+9S/zAIPHhyyYkoHfvLGmc0N6QSqEfUs16RRTLCquumitvUNZxs2Gvqm/RDRfVqviqNRKxlpWe',
      encryptionCertificate: 'MIIC2DCCAcACCQCJmzLC9XOdwzANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJWZXJpZnkgU2VydmljZSBQcm92aWRlciBFbmNyeXB0aW9uMCAXDTE3MDgxMDE1NTgwNFoYDzIxMTcwNzE3MTU1ODA0WjAtMSswKQYDVQQDEyJWZXJpZnkgU2VydmljZSBQcm92aWRlciBFbmNyeXB0aW9uMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwCshPm6j+SBjC6i4kSdlFH0H8pLEOe/8gvrUStN0fCsO7fatgyIoXMOQwtTkuAW9cBL0PYPkKBfpFakZmMyZZPvakqH+QrhAaCFVa0uJmlQ4DEVzuURF0wbkz4XZqOoyomLQATtv9zpb2cHfTCS87ejIQ0/wOCHdiJOCPBcgxGjAL8ztEEuAAypgpTrROoThtxTh4FqdOeqiS03NAZcxi7rMbQ8O20tE4MUIkBmFU2yB+UgW33bOSa1in5MwEdvFT4buP8R+rEZ4cD3+K1TeDpT4ssYCCdo4UC/W9+uSIiTOL1UtmBV8kAnUvDg4LNBe5mJ9M1zZvQlXrgCLNd/noQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQBEsWIcTeU0OlN2bjKVwtfsB5Eb3Mri/wsYc17Rv0rHSyeudiGphlmHYzPvFBz0dMO6YKjEOrX5a6tkN+PQE9otcjBmY4Ice+LlrJ4Vmu1dsG60S/e5lZCYE2BOY0Jpdjk4aJQeMOfyDrJUmjUWzmx+U1IdK6uuatS7+iJdR/z1FwZt+aEqaO+oVxFuBU32z+x/B/l3c5IqIuZePaYcWBFaCQzPAig9EXO3nNwcwRiDWd11nhWshVr5pTMRgSqLXMl/j4RLvr4FYg3sV5MqRqxNBjW5hl64UNfIzmD794yO8Spqgn4BZouOMCZ7Zo+GE/fcZVLhDwRMU3qgmHZBS8jk',
      expectedPID: 'passport-verify-stub-relying-party-pid',
      matchingServiceEntityId: 'https://verify-service-provider-stub-msa',
      matchingServiceSigningPrivateKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQaRaD5w0JythQx5tm26o/V7pmCCZCKydK0dQN73loe39MmbLiKHQlif+h74qC45dBY5tPeq0r1qmTN6HxudADVeQHNHmLDwVJLeJJ8+8GbzZcQPCsvEERY0b0/PVINV9qdGjjeqD4uK15VVWgNwx0Lo4SCufKRZKrazfJtYWk/MrBaoYQ7MEoElaHjMfjMiCsO4YUXi114b2I8fvd0ksz9iFELHZPhVsG19Kprm/ntofnJRJa/v9unK0xLNUt1h22l4jFDbddg5/2qm5oDIy7TgaYR6oT1oGE9TNJ40oo0CwMIMCSQwzDhUBYMAsdBywZQkjPxI6vdGXXfRJ4JHeZAgMBAAECggEABsrmCPaG3kLWOgvHbNrL+bSKRrkNRirR5QZhuvKLKnSb+Yso4WYgIvkUc9qy0QFJ9L+iWDzPWBZvAHVXueEsfm9WN0XmkDm1GmV8cpyYtcT6KJeVQIwCMubhcSqtc+UJbxbMNF3S0UhznvjBCa/BoCfESaJBW75YwW2FK/XWnUHw5N6YJ2T1joZD5FfBMKdnwSR/7C0IH1z4D9IW/cg9RM3VZNjxC9UU5a5E1ndoCdLc7MxBm+zH8M1dC+NOMhqR/iFMcwrF8LsaU3EtbnisVYvbZEQremb+WVrfL+n0PhFMUcoCFkC5eSukRPQ3bN931gUC7EcFlSaeHiPRsaD8YQKBgQD0r/AqfZKnbYCp9vg1rCJU/FiQT/xBz7sWowPQow155iN4jUT22nHiwPnn75qbgRXBiHQkfhUtIWouURn3nzMp81m38cLvkNNUHltAPmXxbANf5nI624uGEKXnCX5uD5efe/cUNLKGA7fnONOhph2m0rKkjAqyqEuOUfU6zC8Q6wKBgQDaC8lWEFeW6g0R4pmpLWb/ZYyKTOW4TkoyTyQBDsGTVhSNi/UsbaFI9egpcLMrgSByCTdaL5AwjcKS3DJBlUGfTd+LRXuPxOSp+111J/XZ2GCXVszV+5eYp/BPwLySRKlmzMSI28oWV6N3u5ZfvvR2PGRh8+mTniWS4GJ4GPDYiwKBgEAipZbdl0UfZKwoOeMHnXAdPLGG5Z3ybx192RAkzPF4qy98B+mUVGmVH2v119aOvT8fHyI5kh9kNMqzI1VOe0CxsoCOdAQLN/lCg7SRJnNjVncaljJrPWUElBe821DJ8XoyKg83yNtruhZ3RLGIMxl4/K44rs0pY7SIMvkYb/XFAoGBAINMpaiVnqjZt5UVhsJA/My+Mar2Mz6Qpk01KtEYOainJSk3JiPiwERXD74khz+jOg5xTkuYaJNUSd51ii3D2wg6tGoBJS6luaxCGTz7GyhbC48WTbJtFhRuzF66CNNrVTb6Bz8CWuapT15CL4LoUf0A0NHLNtQVXzras3DuU9mRAoGBAJfTmPTFnoEkygCo5qAFB/4sm4DYRLIVztImAeD9cwkJG8XEVgj49VWH1Xv8chtavhBnayounHzRfAe/5s+4V12GT9kEGxAnSymqJrlbtMFxZGtNUJpIrslt4KbXnoZCnk/H+2xDog7K9wCxup9PWkUrrNDVu630UgMnTM3wvn42',
      userAccountCreationAttributes: []
    }

    return request({
      uri: `${COMPLIANCE_TOOL_HOST}/service-test-data`,
      method: 'POST',
      json: true,
      body: postData
    })
  })

  it('Should send an AuthnRequest to the compliance tool', async () => {
    await browser.visit(`http://localhost:${server.address().port}`)
    await browser.clickLink('Start')
    browser.assert.status(200)
    browser.assert.url(`${COMPLIANCE_TOOL_HOST}/SAML2/SSO`)
    browser.assert.text('body', /"status" : "PASSED"/)
  })

})
