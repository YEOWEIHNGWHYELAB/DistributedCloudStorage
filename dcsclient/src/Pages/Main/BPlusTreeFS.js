// Node component represents a single node in the B+Tree
class Node {
    constructor(isLeaf = false) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.parent = null;
    }
}

class BPlusTree {
    constructor(order) {
        this.root = new Node(true);
        this.order = order;
        this.fileIdCounter = 1; // Unique identifier counter for files
    }

    // Insert a file into the tree
    insert(filename, directoryPath) {
        const fileId = this.fileIdCounter++;
        const file = { fileId, filename, directoryPath };
        let currentNode = this.findLeafNode(filename);

        // Check if the file already exists
        const existingFiles = currentNode.children.filter(
            (child) => child.filename === filename
        );
        const existingFile = existingFiles.find(
            (child) => child.directoryPath === directoryPath
        );
        if (existingFile) {
            // File already exists with the same filename and directory path
            return;
        }

        // File doesn't exist, insert it
        currentNode.keys.push(filename);
        currentNode.children.push(file);
        currentNode.keys.sort();

        if (currentNode.keys.length > this.order) {
            this.split(currentNode);
        }
    }

    // Delete a file from the tree
    delete(filename, fileId) {
        let currentNode = this.findLeafNode(filename);
        const filesToDelete = currentNode.children.filter(
            (child) => child.filename === filename && child.fileId === fileId
        );

        if (filesToDelete.length === 0) {
            // File doesn't exist
            return;
        }

        for (let file of filesToDelete) {
            const fileIndex = currentNode.children.indexOf(file);
            currentNode.keys.splice(fileIndex, 1);
            currentNode.children.splice(fileIndex, 1);
        }

        if (currentNode.keys.length < Math.ceil(this.order / 2)) {
            this.adjust(currentNode);
        }
    }

    // Search for files with the given filename
    search(filename) {
        let currentNode = this.findLeafNode(filename);
        const files = currentNode.children.filter(
            (child) => child.filename === filename
        );
        return files;
    }

    // Update the directory path of a file
    update(filename, fileId, newDirectoryPath) {
        let currentNode = this.findLeafNode(filename);
        const filesToUpdate = currentNode.children.filter(
            (child) => child.filename === filename && child.fileId === fileId
        );

        if (filesToUpdate.length === 0) {
            // File doesn't exist
            return;
        }

        for (let file of filesToUpdate) {
            file.directoryPath = newDirectoryPath;
        }
    }

    // Find the leaf node that should contain the file
    findLeafNode(filename) {
        let currentNode = this.root;

        while (!currentNode.isLeaf) {
            let index = 0;
            while (
                index < currentNode.keys.length &&
                filename > currentNode.keys[index]
            ) {
                index++;
            }
            currentNode = currentNode.children[index];
        }

        return currentNode;
    }

    // Split a node into two nodes
    split(node) {
        const midIndex = Math.floor(node.keys.length / 2);
        const midKey = node.keys[midIndex];
        const leftKeys = node.keys.slice(0, midIndex);
        const rightKeys = node.keys.slice(midIndex + 1);
        const leftChildren = node.children.slice(0, midIndex + 1);
        const rightChildren = node.children.slice(midIndex + 1);

        const parent = node.parent;
        const newNode = new Node(node.isLeaf);

        newNode.keys = rightKeys;
        newNode.children = rightChildren;
        newNode.parent = parent;

        node.keys = leftKeys;
        node.children = leftChildren;
        node.parent = parent;

        if (parent) {
            const childIndex = parent.children.indexOf(node);
            parent.keys.splice(childIndex, 0, midKey);
            parent.children.splice(childIndex + 1, 0, newNode);

            if (parent.keys.length > this.order) {
                this.split(parent);
            }
        } else {
            const newRoot = new Node(false);
            newRoot.keys.push(midKey);
            newRoot.children.push(node, newNode);
            node.parent = newRoot;
            newNode.parent = newRoot;
            this.root = newRoot;
        }
    }

    // Adjust the tree after deletion
    adjust(node) {
        if (node === this.root) {
            if (node.keys.length === 0 && !node.isLeaf) {
                this.root = node.children[0];
                this.root.parent = null;
            }
            return;
        }

        const parent = node.parent;
        const nodeIndex = parent.children.indexOf(node);
        const leftSibling =
            nodeIndex > 0 ? parent.children[nodeIndex - 1] : null;
        const rightSibling =
            nodeIndex < parent.children.length - 1
                ? parent.children[nodeIndex + 1]
                : null;

        if (node.keys.length < Math.ceil(this.order / 2)) {
            if (
                leftSibling &&
                leftSibling.keys.length > Math.ceil(this.order / 2)
            ) {
                const borrowKey = leftSibling.keys.pop();
                const borrowChild = leftSibling.children.pop();
                node.keys.unshift(borrowKey);
                node.children.unshift(borrowChild);
                parent.keys[nodeIndex - 1] =
                    leftSibling.keys[leftSibling.keys.length - 1];
            } else if (
                rightSibling &&
                rightSibling.keys.length > Math.ceil(this.order / 2)
            ) {
                const borrowKey = rightSibling.keys.shift();
                const borrowChild = rightSibling.children.shift();
                node.keys.push(borrowKey);
                node.children.push(borrowChild);
                parent.keys[nodeIndex] = rightSibling.keys[0];
            } else {
                if (leftSibling) {
                    const mergedNode = this.mergeNodes(leftSibling, node);
                    this.adjust(mergedNode.parent);
                } else if (rightSibling) {
                    const mergedNode = this.mergeNodes(node, rightSibling);
                    this.adjust(mergedNode.parent);
                }
            }
        }
    }

    // Merge two sibling nodes
    mergeNodes(leftNode, rightNode) {
        const parent = leftNode.parent;
        const leftIndex = parent.children.indexOf(leftNode);
        const rightIndex = parent.children.indexOf(rightNode);
        const mergedNode = new Node(rightNode.isLeaf);

        mergedNode.keys = leftNode.keys.concat(rightNode.keys);
        mergedNode.children = leftNode.children.concat(rightNode.children);
        mergedNode.parent = parent;

        parent.keys.splice(leftIndex, 1);
        parent.children.splice(leftIndex, 2, mergedNode);

        for (let child of mergedNode.children) {
            child.parent = mergedNode;
        }

        if (parent.keys.length === 0) {
            this.adjust(parent);
        }

        return mergedNode;
    }
}

// Create a new B+Tree with order 4
const fileSystem = new BPlusTree(4);

// Insert files into the file system
fileSystem.insert("file1.txt", "/documents");
fileSystem.insert("file2.txt", "/documents");
fileSystem.insert("file1.txt", "/photos");
fileSystem.insert("file3.txt", "/documents");

// Search for files
const filesWithFilename1 = fileSystem.search("file1.txt");
console.log("Files with filename 'file1.txt':", filesWithFilename1);

// Update the directory path of a file
fileSystem.update("file1.txt", 3, "/newpath");

// Delete a file
fileSystem.delete("file1.txt", 1);

// Search for files after deletion
const filesWithFilename1Updated = fileSystem.search("file1.txt");
console.log(
    "Files with filename 'file1.txt' after deletion:",
    filesWithFilename1Updated
);
