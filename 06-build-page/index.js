const path = require('path');
const fsp = require('fs/promises');
const { create } = require('domain');

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

const createFolder = async (path) => {
    try {
        await fsp.access(path);
    } catch (error) {
        await fsp.mkdir(path);
    }
};

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
    } catch (err) {
        /* try...catch access */
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
            path.join(__dirname, file.path.replace(src, dest), file.name)
        );
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

const buildTemplate = async (src, components) => {
    let template = await fsp.readFile(path.join(__dirname, src), {
        encoding: 'utf8',
    });
    const tags = [...template.match(/{{.*}}/g)];

    for (const tag of tags) {
        try {
            const replace = await fsp.readFile(
                path.join(
                    __dirname,
                    components,
                    `${tag.replace('{{', '').replace('}}', '')}.html`
                ),
                {
                    encoding: 'utf8',
                }
            );
            template = template.replace(tag, replace);
        } catch (error) {
            console.log(error);
        }
    }
    return template;
};

const build = async ({ src, copy, dist, styles }) => {
    const build = await buildTemplate('template.html', src);
    await cleanFolder(path.join(__dirname, dist));
    await createFolder(path.join(__dirname, dist));

    try {
        fsp.writeFile(path.join(__dirname, dist, `index.html`), build);
    } catch (error) {
        console.log(error);
    }

    if (copy) copyFiles(copy, path.join(dist, copy));
    createBundle('style', 'css', styles, dist);
};

build({
    src: 'components',
    copy: 'assets',
    dist: 'project-dist',
    styles: 'styles',
});
