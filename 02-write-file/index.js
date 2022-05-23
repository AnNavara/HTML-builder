const path = require('path');
const fs = require('fs');
const rl = require('readline');
const { stdin: input, stdout: output } = process;
const readline = rl.createInterface({ input, output });
const filename = `${Date.now()}.txt`;
const append = (data) => {
    if (input.match(/^exit?$/i)) process.exit();
    fs.appendFile(path.join(__dirname, filename), data, (err) => {
        if (err) throw new Error(err);
    });
};

fs.writeFile(path.join(__dirname, filename), '', (err) => {
    if (err) throw new Error(err);
});

readline.question('\nВведите текст\n', (answer) => {
    append(answer + '\n');
});

readline.on('line', (input) => {
    append(input + '\n');
});

process.on('SIGINT', () => {
    process.exit();
});

process.on('exit', () => {
    output.write('\nПрограмма завершена\n');
});
