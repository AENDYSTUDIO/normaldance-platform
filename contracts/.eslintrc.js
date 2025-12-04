module.exports = {
  env: {
    mocha: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-var-requires': 'off',
  },
  globals: {
    describe: true,
    it: true,
    beforeEach: true,
    afterEach: true,
    before: true,
    after: true,
    contract: true,
    artifacts: true,
    web3: true,
    assert: true,
    network: true,
    ethers: true,
  },
};