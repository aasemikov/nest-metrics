const fs = require('fs');
const path = require('path');

function updatePatchVersion() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = packageJson.version;

        const versionParts = currentVersion.split('.').map(Number);

        if (versionParts.length !== 3) {
            throw new Error('Version format should be X.Y.Z');
        }

        const execSync = require('child_process').execSync;
        const stagedFiles = execSync('git diff --name-only --cached', { encoding: 'utf8' })
            .trim()
            .split('\n');

        const isPackageJsonModified = stagedFiles.includes('package.json');

        let newVersion;

        if (isPackageJsonModified) {
            const oldPackageJson = JSON.parse(
                execSync('git show HEAD:package.json 2>/dev/null || echo "{}"', {
                    encoding: 'utf8',
                }),
            );
            const oldVersion = oldPackageJson.version || '0.0.0';
            const oldVersionParts = oldVersion.split('.').map(Number);

            if (versionParts[1] !== oldVersionParts[1]) {
                newVersion = `${versionParts[0]}.${versionParts[1]}.0`;
                console.log(
                    `Minor version changed manually, resetting patch to 0: ${newVersion}`,
                );
            } else {
                newVersion = currentVersion;
                console.log(`Patch version changed manually, keeping: ${newVersion}`);
            }
        } else {
            versionParts[2] += 1;
            newVersion = versionParts.join('.');
            console.log(`Auto-incrementing patch version: ${currentVersion} → ${newVersion}`);
        }

        if (newVersion !== currentVersion) {
            packageJson.version = newVersion;
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`Version updated: ${newVersion}`);

            execSync('git add package.json', { stdio: 'inherit' });
        } else {
            console.log(`Version unchanged: ${currentVersion}`);
        }
    } catch (error) {
        console.error('Error updating version:', error.message);
        process.exit(1);
    }
}

updatePatchVersion();
