const path = require('path');
const fs = require('fs');

const getFiles = async (folder) => {
    try {
        const files = [];
        const entries = await fs.promises.readdir(
            path.join(__dirname, folder),
            {
                withFileTypes: true,
            }
        );
        for (const file of entries) {
            if (file.isFile()) {
                if (file.name !== '.gitkeep')
                    files.push({ name: file.name, path: folder });
            } else if (file.isDirectory()) {
                const newFiles = await getFiles(path.join(folder, file.name));
                if (newFiles.length) files.push(...newFiles);
            }
        }
        return files;
    } catch (err) {
        console.log(err);
    }
};

(async () => {
    const files = await getFiles('secret-folder')
        .then(data => data.map((file) => {
            const ext = path.extname(path.join(file.path, file.name));
            return {
                ...file,
                name: file.name.replace(ext, ''),
                ext: ext.replace('.', ''),
            };
    }));
    files.forEach(async (file) => {
        const size = Math.round((
            (await fs.promises.stat(
                        path.join(
                            __dirname,
                            file.path,
                            `${file.name}.${file.ext}`
                    ))
            ).size / 1024) * 100) / 100;
        console.log(`${file.name} - ${file.ext} - ${size}kb`);
    });
})();