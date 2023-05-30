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
        const pathArray = path.split('/');

        for (let i = 1; i < pathArray.length; i++) {
            if (pathArray[i] == "") {
                return false;
            }
        }

        return true;
    }

    mkdir(path) {
        if (!this.isValidDir(path)) {
            return;
        }

        let curr_dir = this.root;

        const pathArray = path.split('/');

        for (let i = 1; i < pathArray.length; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                curr_dir.directories.set(pathArray[i], new Directory());
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }
    }

    deldir(path) {
        let curr_dir = this.root;

        const pathArray = path.split('/');

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                alert("Path does not exist!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        if (curr_dir.directories.has(pathArray[pathArray.length - 1])) {
            curr_dir.directories.delete(pathArray[pathArray.length - 1]);
        } else {
            alert("Path does not exist!");
        }
    }

    mkfile(path, fileID) {
        if (!this.isValidDir(path)) {
            return;
        }

        let curr_dir = this.root;

        const pathArray = path.split('/');

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                curr_dir.directories.set(pathArray[i], new Directory());
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        curr_dir.files.set(fileID, pathArray[pathArray.length - 1]);
    }

    delfile(path) {
        let curr_dir = this.root;

        const pathArray = path.split('/');

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                alert("Invalid file path!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        if (curr_dir.files.has(pathArray[pathArray.length - 1])) {
            curr_dir.files.delete(pathArray[pathArray.length - 1]);
        } else {
            alert("File does not exist!");
        }
    }

    ls(path_target) {
        let curr_dir = this.root;

        const files_directories = [];

        if (path_target !== '/') {
            const path_array = path_target.split('/');

            for (let i = 1; i < path_array.length - 1; i++) {
                curr_dir = curr_dir.directories.get(path_array[i]);
            }

            if (curr_dir.files.has(path_array[path_array.length - 1])) {
                files_directories.push(path_array[path_array.length - 1]);
                return files_directories;
            } else {
                curr_dir = curr_dir.directories.get(path_array[path_array.length - 1]);
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

console.log(fsManager.ls("/"));
console.log(fsManager.ls("/Documents"));
*/
