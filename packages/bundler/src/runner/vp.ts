import { PaymasterAPI } from '@account-abstraction/sdk'
import { UserOperationStruct } from '@account-abstraction/contracts'
import { ethers } from 'ethers'

export class VerifyingPaymasterAPI extends PaymasterAPI {
  private readonly paymasterUrl: string
  private readonly entryPoint: string
  constructor (
    paymasterUrl: string,
    entryPoint: string,
    clientId?: string,
    secretKey?: string
  ) {
    super()
    this.paymasterUrl = paymasterUrl
    this.entryPoint = entryPoint
  }
/* eslint-disable */
  async getPaymasterAndData(
    userOp: Partial<UserOperationStruct>
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Ask the paymaster to sign the transaction and return a valid paymasterAndData value.
    const request = {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_sponsorUserOperation',
          params: [await toJSON(userOp), { entryPoint: this.entryPoint }]
        })
      }

    const response = await fetch(this.paymasterUrl,request )
    const res: any = await response.json()
     if (!response.ok) {
      throw new Error('Paymaster error: ')
    }

    if (res.result) {
      const result = (res.result as any).paymasterAndData || res.result
      return result.toString();
    } else {
      throw new Error(`Paymaster returned no result from ${this.paymasterUrl}`);
    }
  }
}
/* eslint-disable */
async function toJSON(op: Partial<UserOperationStruct>): Promise<any> {
    return ethers.utils.resolveProperties(op).then((userOp) =>
      Object.keys(userOp)
        .map((key) => {
          let val = (userOp as any)[key];
          if (typeof val !== "string" || !val.startsWith("0x")) {
            val = ethers.utils.hexValue(val);
          }
          return [key, val];
        })
        .reduce(
          (set, [k, v]) => ({
            ...set,
            [k]: v,
          }),
          {},
        ),
    );
  }
  
 // export const getVerifyingPaymaster = (
//   paymasterUrl: string,
//   entryPoint: string,
// ) => new VerifyingPaymasterAPI(paymasterUrl, entryPoint);
