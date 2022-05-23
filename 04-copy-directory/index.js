const path = require('path');
const fsp = require('fs/promises');
const { join } = require('path');

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

const copyFiles = async (src, dest) => {
    const files = await getFiles(src);
    const folders = [
        dest,
        ...files
            .map((file) => file.path)
            .filter((value) => value !== src)
            .filter((value, index, arr) => arr.indexOf(value) === index)
            .map((str) => str.replace(src, dest)),
    ];

    const cleanFolder = async (dir) => {
        try {
            await fsp.access(path.join(__dirname, dir));
            const entries = await fsp.readdir(path.join(__dirname, dir), {
                withFileTypes: true,
            });
            if (!entries.length) return;
            for (const entrie of entries) {
                await fsp.rm(path.join(__dirname, dir, entrie.name), {
                    recursive: true,
                });
            }
        } catch (err) {/* try...catch access */}
    };

    const createFolder = async (path) => {
        try {
            await fsp.access(path);
        } catch (error) {
            await fsp.mkdir(path);
        }
    };

    await cleanFolder(dest);

    for (const folder of folders) {
        const subfolders = folder.split(path.sep);
        for (let i = 0; i <= subfolders.length; i++) {
            if (subfolders.slice(0, [i]).length) {
                const folderPath = path.join(
                    __dirname,
                    ...subfolders.slice(0, [i])
                );
                await createFolder(folderPath);
            }
        }
    }

    for (const file of files) {
        fsp.copyFile(
            path.join(__dirname, file.path, file.name),
            path.join(
                __dirname,
                file.path.replace(src, dest),
                file.name
            )
        );
    }
};

copyFiles('files', 'files-copy');