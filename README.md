![Banner](https://github.com/thirdweb-example/thirdweb-auth-express/assets/17715009/06383e68-9c65-4265-8505-e88e573443f9)
# thirdweb expo starter

Starter template to build an onchain react native app with [thirdweb](https://thirdweb.com/) and [expo](https://expo.dev/).

### Features

- in-app wallets using phone number, email or social logins to create a wallet for the user
- smart accounts to sponsor gas
- connecting to external wallets like MetaMask via WalletConnect
- autoconnecting to the last connected wallet on launch
- reading contract state and events
- writing to the blockchain

## Installation

Install the template using [thirdweb create](https://portal.thirdweb.com/cli/create)

```bash
  npx thirdweb create app --expo
```

## Get started

1. Install dependencies

```bash
yarn install
```

2. Get your thirdweb client id

Rename the `.env.example` file to `.env` and paste in your thirdweb client id.

You can obtain a free client id from the [thirdweb dashboard](https://thirdweb.com/dashboard/settings).

3. Start the app

```bash
yarn ios
```

or

```bash
yarn android
```

To run this app, you'll need either:

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

## Additional Resources

- [Documentation](https://portal.thirdweb.com/typescript/v5)
- [Templates](https://thirdweb.com/templates)
- [YouTube](https://www.youtube.com/c/thirdweb)

## Support

For help or feedback, please [visit our support site](https://thirdweb.com/support)
