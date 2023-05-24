// Node component represents a single node in the B+Tree
class Node {
    constructor(isLeaf = false) {
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
        this.parent = null;
    }
}

// BPlusTree component represents the B+Tree
class BPlusTree {
    constructor(order) {
        this.root = new Node(true);
        this.order = order;
    }

    // Insert a file into the tree
    insert(filename, directoryPath) {
        const file = { filename, directoryPath };
        let currentNode = this.findLeafNode(filename);

        // Check if the file already exists
        const existingFileIndex = currentNode.keys.findIndex(key => key === filename);
        if (existingFileIndex !== -1) {
            // File already exists, update its directory path
            currentNode.children[existingFileIndex].directoryPath = directoryPath;
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
    delete(filename) {
        let currentNode = this.findLeafNode(filename);
        const fileIndex = currentNode.keys.findIndex(key => key === filename);

        if (fileIndex === -1) {
            // File doesn't exist
            return;
        }

        currentNode.keys.splice(fileIndex, 1);
        currentNode.children.splice(fileIndex, 1);

        if (currentNode.keys.length < Math.ceil(this.order / 2)) {
            this.adjust(currentNode);
        }
    }

    // Update the directory path of a file in the tree
    update(filename, newDirectoryPath) {
        let currentNode = this.findLeafNode(filename);
        const fileIndex = currentNode.keys.findIndex(key => key === filename);

        if (fileIndex === -1) {
            // File doesn't exist
            return;
        }

        currentNode.children[fileIndex].directoryPath = newDirectoryPath;
    }

    // Search for a file in the tree
    search(filename) {
        let currentNode = this.findLeafNode(filename);
        const fileIndex = currentNode.keys.findIndex(key => key === filename);

        if (fileIndex === -1) {
            // File doesn't exist
            return null;
        }

        return currentNode.children[fileIndex];
    }

    // Find the leaf node that should contain the file
    findLeafNode(filename) {
        let currentNode = this.root;

        while (!currentNode.isLeaf) {
            let index = 0;
            while (index < currentNode.keys.length && filename > currentNode.keys[index]) {
                index++;
            }
            currentNode = currentNode.children[index];
        }

        return currentNode;
    }

    // Split a node into two nodes
    split(node) {
        const medianIndex = Math.floor(node.keys.length / 2);
        const median = node.keys[medianIndex];

        const leftNode = new Node(node.isLeaf);
        const rightNode = new Node(node.isLeaf);

        // Split keys and children between left and right nodes
        leftNode.keys = node.keys.slice(0, medianIndex);
        rightNode.keys = node.keys.slice(medianIndex + 1);
        leftNode.children = node.children.slice(0, medianIndex + 1);
        rightNode.children = node.children.slice(medianIndex + 1);

        // Update parent-child relationship
        for (let child of leftNode.children) {
            child.parent = leftNode;
        }
        for (let child of rightNode.children) {
            child.parent = rightNode;
        }

        if (node.parent === null) {
            // Splitting the root node
            const newRoot = new Node();
            newRoot.keys.push(median);
            newRoot.children.push(leftNode, rightNode);
            this.root = newRoot;
            leftNode.parent = newRoot;
            rightNode.parent = newRoot;
        } else {
            // Insert median into parent node
            const parent = node.parent;
            const medianIndexParent = parent.keys.findIndex(key => key > median);

            parent.keys.splice(medianIndexParent, 0, median);
            parent.children.splice(medianIndexParent, 1, leftNode, rightNode);

            if (parent.keys.length > this.order) {
                this.split(parent);
            }
        }
    }

    // Adjust the tree after deletion
    adjust(node) {
        const parent = node.parent;

        if (parent === null) {
            // Adjusting the root node
            if (node.keys.length === 0 && node.children.length === 1) {
                this.root = node.children[0];
                this.root.parent = null;
            }
            return;
        }

        const index = parent.children.indexOf(node);
        const prevSibling = parent.children[index - 1];
        const nextSibling = parent.children[index + 1];

        if (node.keys.length < Math.ceil(this.order / 2)) {
            if (prevSibling && prevSibling.keys.length > Math.ceil(this.order / 2)) {
                // Borrow from left sibling
                const borrowedKey = prevSibling.keys.pop();
                const borrowedChild = prevSibling.children.pop();

                node.keys.unshift(borrowedKey);
                node.children.unshift(borrowedChild);

                if (!node.isLeaf) {
                    borrowedChild.parent = node;
                }

                parent.keys[index - 1] = prevSibling.keys[prevSibling.keys.length - 1];
            } else if (nextSibling && nextSibling.keys.length > Math.ceil(this.order / 2)) {
                // Borrow from right sibling
                const borrowedKey = nextSibling.keys.shift();
                const borrowedChild = nextSibling.children.shift();

                node.keys.push(borrowedKey);
                node.children.push(borrowedChild);

                if (!node.isLeaf) {
                    borrowedChild.parent = node;
                }

                parent.keys[index] = nextSibling.keys[0];
            } else if (prevSibling) {
                // Merge with left sibling
                const mergedKeys = prevSibling.keys.concat(node.keys);
                const mergedChildren = prevSibling.children.concat(node.children);

                prevSibling.keys = mergedKeys;
                prevSibling.children = mergedChildren;

                if (!node.isLeaf) {
                    for (let child of node.children) {
                        child.parent = prevSibling;
                    }
                }

                parent.keys.splice(index - 1, 1);
                parent.children.splice(index, 1);

                if (parent.keys.length < Math.ceil(this.order / 2)) {
                    this.adjust(parent);
                }
            } else if (nextSibling) {
                // Merge with right sibling
                const mergedKeys = node.keys.concat(nextSibling.keys);
                const mergedChildren = node.children.concat(nextSibling.children);

                node.keys = mergedKeys;
                node.children = mergedChildren;

                if (!node.isLeaf) {
                    for (let child of nextSibling.children) {
                        child.parent = node;
                    }
                }

                parent.keys.splice(index, 1);
                parent.children.splice(index + 1, 1);

                if (parent.keys.length < Math.ceil(this.order / 2)) {
                    this.adjust(parent);
                }
            }
        }
    }
}

// // Create an instance of the BPlusTree
// const fileSystem = new BPlusTree(4); // Specify the order of the B+Tree

// // Insert files into the file system
// fileSystem.insert("file1.txt", "/documents/");
// fileSystem.insert("file2.txt", "/documents/");
// fileSystem.insert("file3.txt", "/pictures/");
// fileSystem.insert("file4.txt", "/music/");

// // Search for a file
// const file1 = fileSystem.search("file1.txt");
// console.log(file1); // Output: { filename: "file1.txt", directoryPath: "/documents/" }

// // Update the directory path of a file
// fileSystem.update("file2.txt", "/new_directory/");
// const updatedFile2 = fileSystem.search("file2.txt");
// console.log(updatedFile2); // Output: { filename: "file2.txt", directoryPath: "/new_directory/" }

// // Delete a file
// fileSystem.delete("file3.txt");

// // Search for the deleted file
// const deletedFile = fileSystem.search("file3.txt");
// console.log(deletedFile); // Output: null
