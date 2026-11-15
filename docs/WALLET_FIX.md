# Wallet connection patch - 15 November 2026

The user reported `Wallet connection failed` in Chrome. The exact original provider error was not available, so a successful real-wallet fix is not claimed without a retry by the owner.

Two verified code paths were addressed:

1. `catch` previously accepted only JavaScript Error instances. EIP-1193 provider errors can be plain objects, so their message and code were discarded. The app now shows stage-specific diagnostics and actionable codes for rejected, pending, unauthorized, unsupported, and disconnected requests.
2. `genlayer-js@1.1.8`'s `connect` helper unconditionally performs MetaMask Snap discovery/installation. Its installed contract write path instead uses the supplied EIP-1193 provider and `eth_sendTransaction`. Account/network connection now uses EIP-1193, EIP-3326, and EIP-3085 directly, while all contract writes and finality checks still use the official SDK. Network parameters come exclusively from its official studionet preset. No private key, fake signer, or alternate chain is introduced.

The connection switches a known chain first and adds it only after error 4902. It verifies the final network and selected account, prevents concurrent Connect attempts, and binds account/network listeners only to the active session. Disconnect detaches that session. Before any write, the application rechecks the network and active account so changed signers cannot silently submit.

Regression tests cover no-Snap connection, existing/unknown chains, user rejection, nested provider errors, pending requests, invalid/revoked account access, UI error presentation, and changed accounts before submission. These use mocked provider requests and do not sign transactions or prove that the owner's wallet works.

After the patched deployment is ready, reload https://agenttrust-ten.vercel.app with Ctrl+Shift+R. Unlock MetaMask and click Connect wallet. Complete or cancel any old extension popup first. Approve account access and network prompts yourself. If it still fails, report the new stage/message/code, without sending private keys or seed phrases.
