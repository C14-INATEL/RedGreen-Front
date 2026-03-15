export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'ci',
        'test',
        'chore',
        'docs',
        'feat',
        'fix',
        'hotfix',
        'perf',
        'refactor',
        'revert',
        'style'
      ]
    ]
  }
};