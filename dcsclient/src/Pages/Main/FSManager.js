class Directory {
    constructor() {
        this.directories = new Map();
        this.files = new Map();
    }
}


class FSManager {
    constructor() {
        this.root = new Directory();
    }

    mkdir(path) {
        let curr_dir = this.root;

        const pathArray = path.split('/');

        for (let i = 1; i < pathArray.length; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                curr_dir.directories.set(pathArray[i], new Directory());
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
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
        files_directories.push(...curr_dir.files.keys());

        return files_directories;
    }
}

/*
// Mini Test
let fsManager = new FSManager();

fsManager.mkdir("/Documents/Photos");
fsManager.mkdir("/Notes");
fsManager.mkdir("/Documents/lalala");

console.log(fsManager.ls("/"));
console.log(fsManager.ls("/Documents"));
*/
