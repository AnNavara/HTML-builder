const path = require('path');
const fsp = require('fs/promises');

const getFiles = async (folder) => {
    try {
        const files = [];
        const entries = await fsp.readdir(path.join(__dirname, folder), {
            withFileTypes: true,
        });
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
    } catch (error) {
        console.log(error);
    }
};

const createBundle = async (name, ext, src, dist) => {
    const data = [];
    const files = await getFiles(src);
    const filtered = files.filter((file) => {
        return (
            path.extname(path.join(file.path, file.name)).replace('.', '') ===
            ext
        );
    });

    for (const file of filtered) {
        try {
            const fileData = await fsp.readFile(
                path.join(__dirname, file.path, file.name),
                {
                    encoding: 'utf8',
                }
            );
            data.push(fileData);
        } catch (error) {
            console.log(error);
        }
    }

    try {
        fsp.writeFile(
            path.join(__dirname, dist, `${name}.${ext}`),
            data.join('\n')
        );
    } catch (error) {
        console.log(error);
    }
};

createBundle('bundle', 'css', 'styles', 'project-dist');
