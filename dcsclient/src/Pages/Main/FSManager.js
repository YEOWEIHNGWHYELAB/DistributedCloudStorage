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
                return alert("Path does not exist!");
            }
        } else {
            if (curr_dir.files.has(fileID)) {
                curr_dir.files.delete(fileID);

                if (!isDelete) {
                    curr_dir.files.set(fileID, newName);
                }
            } else {
                return alert("File does not exist!");
            }
        }
    }

    filefolderrename(curr_dir, pathArray, isDir, isDelete, newName, fileID) {
        if (isDir) {
            if (curr_dir.directories.has(pathArray[pathArray.length - 1])) {
                let dir_child = curr_dir.directories.get(pathArray[pathArray.length - 1]);

                curr_dir.directories.delete(pathArray[pathArray.length - 1]);

                if (!isDelete) {
                    curr_dir.directories.set(newName, new Directory());

                    let new_path = curr_dir.directories.get(newName);

                    for (const [key, value] of dir_child.directories) {
                        new_path.directories.set(key, value);
                    }

                    for (const [key, value] of dir_child.files) {
                        new_path.files.set(key, value);
                    }
                }
            } else {
                return alert("Path does not exist!");
            }
        } else {
            if (curr_dir.files.has(fileID)) {
                let fileInfo = curr_dir.files.get(fileID);
                fileInfo["filename"] = newName

                curr_dir.files.delete(fileID);

                if (!isDelete) {
                    curr_dir.files.set(fileID, fileInfo);
                }
            } else {
                return alert("File does not exist!");
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
                return alert("Path does not exist!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefolderrename(curr_dir, pathArray, true, false, folderName, null);
    }

    mvdir(path_target, new_path_target) {
        // Parse old path
        let curr_dir = this.root;

        const path_array = path_target.split("/");

        for (let i = 1; i < path_array.length; i++) {
            curr_dir = curr_dir.directories.get(path_array[i]);
        }

        let curr_dir_map = curr_dir.directories;
        let curr_file_map = curr_dir.files;

        // Parsing new path
        let new_path = this.root;

        if (new_path_target != "/") {
            // If you are not moving the folder to the root directory
            const new_path_array = new_path_target.split("/");

            for (let i = 1; i < new_path_array.length; i++) {
                new_path = new_path.directories.get(new_path_array[i]);
            }
        }

        if (new_path.directories.has(path_array[path_array.length - 1])) {
            // If the directory already have the same folder name 
            // as the one you are moving to
            new_path = new_path.directories.get(path_array[path_array.length - 1]);
        } else {
            new_path.directories.set(path_array[path_array.length - 1], new Directory());
            new_path = new_path.directories.get(path_array[path_array.length - 1]);
        }

        for (const [key, value] of curr_dir_map) {
            new_path.directories.set(key, value);
        }

        for (const [key, value] of curr_file_map) {
            new_path.files.set(key, value);
        }
    }

    deldir(path) {
        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return alert("Path does not exist!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefoldermod(curr_dir, pathArray, true, true, null, null);
    }

    mkfile(path, fileID, created_at) {
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

        curr_dir.files.set(fileID, { id: fileID, filename: pathArray[pathArray.length - 1], created_at: created_at });
    }

    renamefile(path, fileID, fileName) {
        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return alert("Invalid file path!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefolderrename(curr_dir, pathArray, false, false, fileName, fileID);
    }

    delfile(path, fileID) {
        let curr_dir = this.root;

        const pathArray = path.split("/");

        for (let i = 1; i < pathArray.length - 1; i++) {
            if (!curr_dir.directories.has(pathArray[i])) {
                return alert("Invalid file path!");
            }

            curr_dir = curr_dir.directories.get(pathArray[i]);
        }

        this.filefoldermod(curr_dir, pathArray, false, true, null, fileID);
    }

    ld(path_target) {
        let curr_dir = this.root;

        const directoriesTarget = [];

        if (path_target !== "/") {
            const path_array = path_target.split("/");

            for (let i = 1; i < path_array.length; i++) {
                curr_dir = curr_dir.directories.get(path_array[i]);
            }
        }

        directoriesTarget.push(...curr_dir.directories.keys());

        return directoriesTarget;
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
                // If target is a file
                files_directories.push(path_array[path_array.length - 1]);
                return files_directories;
            } else {
                // The target is not a file but a directory
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

    // Depth-first search function
    dfs(node, searchTerm, files_matched) {
        if (node === null) {
            return; // Base case: empty node
        }

        // Check if the current node contains the search term
        for (const file of node.files.keys()) {
            const fileMeta = node.files.get(file);

            if (fileMeta.filename.includes(searchTerm)) {
                files_matched.push(fileMeta);
            }
        }
    
        // Recursively search subdirectories
        for (const directory of node.directories.values()) {
            this.dfs(directory, searchTerm, files_matched);
        }
    }

    search(search_term) {
        let curr_dir = this.root;

        let files_matched = [];

        this.dfs(curr_dir, search_term, files_matched);

        return files_matched;
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

// Testing nested files and folder when moving folders
/*
let fsManager = new FSManager();

fsManager.mkdir("/Documents/lalala");
fsManager.mkdir("/Documents/lalala/vids");
fsManager.mkfile("/Documents/lalala/vids/note213.txt", "gh_42");
fsManager.mkfile("/Documents/lalala/note.txt", "gh_4");
fsManager.mkfile("/Documents/lalala/video.mp4", "yt_inwg");
fsManager.mkdir("/Documents/nick");
console.log(fsManager.ls("/Documents/lalala"));
fsManager.mvdir("/Documents/lalala", "/Documents/nick");
console.log(fsManager.ls("/Documents/nick"));
console.log(fsManager.ls("/Documents/nick/lalala"));
console.log(fsManager.ls("/Documents/nick/lalala/vids"));
*/

// Testing DFS Searching
/*
let fsManager = new FSManager();
fsManager.mkdir("/Documents/lalala");
fsManager.mkdir("/Documents/lalala/vids");
fsManager.mkfile("/Documents/lalala/vids/note213.txt", "gh_42");
fsManager.mkfile("/Documents/lalala/note.txt", "gh_4");
fsManager.mkfile("/Documents/lalala/vids/video.mp4", "yt_inwg");
fsManager.mkfile("/Documents/lalala/video3.mp4", "yt_in2wg");
fsManager.mkfile("/Documents/lalala/video2.mp4", "yt_i3n2wg");
fsManager.mkfile("/Documents/lalala/video2.mp4", "yt_inwg1");
fsManager.mkdir("/Documents/nick");
fsManager.mkfile("/Documents/video23.mp4", "yt_inw5g1");
fsManager.mkfile("/Documents/video24.mp4", "yt_in4wg1");
fsManager.mkfile("/video25.mp4", "yt_in3wg1");
fsManager.mkfile("/video245.mp4", "yt_i1n43wg1");
console.log(fsManager.search("video2"));
*/