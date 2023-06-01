class Directory {
    constructor() {
        this.directories = new Map();
        this.files = new Map();
    }
}

export default class FSManager {
    constructor() {
        this.root = new Directory();
    }

    isValidDir(path) {
        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length; i++) {
            if (pathArray[i] == "") {
                return false;
            }
        }

        return true;
    }

    filefoldermod(curr_dir, pathArray, isDir, isDelete, newName, fileID) {
        if (isDir) {
            if (curr_dir.directories.has(pathArray[pathArray.length - 1])) {
                curr_dir.directories.delete(pathArray[pathArray.length - 1]);

                if (!isDelete) {
                    curr_dir.directories.set(newName, new Directory());
                }
            } else {
                return console.log("Path does not exist!");
            }
        } else {
            if (curr_dir.files.has(fileID)) {
                curr_dir.files.delete(fileID);

                if (!isDelete) {
                    curr_dir.files.set(fileID, newName);
                }
            } else {
                return console.log("File does not exist!");
            }
        }
    }

    mkdir(path) {
        if (!this.isValidDir(path)) {
            return;
        }

        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                curr_dir.directories.set(pathArray[i], new Directory());
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }
    }

    renamedir(path, folderName) {
        if (!this.isValidDir(path)) {
            return;
        }

        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return console.log("Path does not exist!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefoldermod(curr_dir, pathArray, true, false, folderName, null);
    }

    deldir(path) {
        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return console.log("Path does not exist!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefoldermod(curr_dir, pathArray, true, true, null, null);
    }

    mkfile(path, fileID) {
        if (!this.isValidDir(path)) {
            return;
        }

        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                curr_dir.directories.set(pathArray[i], new Directory());
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        curr_dir.files.set(fileID, pathArray[pathArray.length - 1]);
    }

    renamefile(path, fileID, fileName) {
        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return console.log("Invalid file path!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefoldermod(curr_dir, pathArray, false, false, fileName, fileID);
    }

    delfile(path, fileID) {
        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return console.log("Invalid file path!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefoldermod(curr_dir, pathArray, false, true, null, fileID);
    }

    ls(path_target) {
        let curr_dir = this.root;

        const files_directories = [];

        if (path_target !== "/") {
            const path_array = path_target.split("/");

            for (let i = 1; i < path_array.length - 1; i++) {
                curr_dir = curr_dir.directories.get(path_array[i]);
            }

            if (curr_dir.files.has(path_array[path_array.length - 1])) {
                files_directories.push(path_array[path_array.length - 1]);
                return files_directories;
            } else {
                curr_dir = curr_dir.directories.get(
                    path_array[path_array.length - 1]
                );
            }
        }

        files_directories.push(...curr_dir.directories.keys());

        for (let fileID of curr_dir.files.keys()) {
            files_directories.push(curr_dir.files.get(fileID));
        }

        return files_directories;
    }
}

// Mini Test
/*
let fsManager = new FSManager();

fsManager.mkdir("/Documents/Photos");
fsManager.mkdir("/Notes");
fsManager.mkdir("/Documents/lalala");
fsManager.mkfile("/Documents/note.txt", "gh_4");
fsManager.mkfile("/Documents/video.mp4", "yt_inwg");
console.log(fsManager.ls("/"));
console.log(fsManager.ls("/Documents"));

fsManager.delfile("/Documents/video.mp4", "yt_inwg");
fsManager.renamefile("/Documents/note.txt", "gh_4", "test.txt");
console.log(fsManager.ls("/Documents"));

fsManager.deldir("/Documents");
fsManager.renamedir("/Notes", "Test");
fsManager.mkfile("/video.mp4", "yt_inwg");
console.log(fsManager.ls("/"));

fsManager.deldir("/Test");
console.log(fsManager.ls("/"));
*/
