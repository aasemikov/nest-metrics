#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const changeType = process.argv[2];
const commitMessage = process.argv[3] || '';

const packageJsonPath = path.join(process.cwd(), 'package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

const versionParts = currentVersion.split('.').map(part => parseInt(part, 10));

if (versionParts.length !== 3) {
    console.error('Неверный формат версии. Должно быть 3 цифры, разделенные точками.');
    process.exit(1);
}

function determineChangeTypeFromMessage(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('breaking') || lowerMessage.includes('major')) {
        return 'major';
    } else if (lowerMessage.startsWith('feat') || lowerMessage.includes('feature')) {
        return 'minor';
    } else if (lowerMessage.startsWith('fix') || lowerMessage.includes('bugfix')) {
        return 'patch';
    } else {
        return 'patch';
    }
}

const finalChangeType = changeType || determineChangeTypeFromMessage(commitMessage);

switch (finalChangeType) {
    case 'major':
        versionParts[0] += 1;
        versionParts[1] = 0;
        versionParts[2] = 0;
        console.log(`Увеличиваем MAJOR версию`);
        break;
    case 'minor':
        versionParts[1] += 1;
        versionParts[2] = 0;
        console.log(`Увеличиваем MINOR версию`);
        break;
    case 'patch':
        versionParts[2] += 1;
        console.log(`Увеличиваем PATCH версию`);
        break;
    default:
        console.error(`Неизвестный тип изменения: ${finalChangeType}`);
        console.error('Допустимые значения: major, minor, patch');
        process.exit(1);
}

const newVersion = versionParts.join('.');

packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Версия обновлена: ${currentVersion} → ${newVersion}`);
