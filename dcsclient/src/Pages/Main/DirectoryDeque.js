class Node {
    constructor(value) {
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

export default class Deque {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // Add an element to the front of the deque
    addFront(element) {
        const newNode = new Node(element);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }

        this.size++;
    }

    // Add an element to the back of the deque
    addRear(element) {
        const newNode = new Node(element);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.size++;
    }

    // Remove and return the element from the front of the deque
    removeFront() {
        if (this.isEmpty()) {
            console.log("Deque is empty");
        }

        const removedNode = this.head;

        if (this.size === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }

        this.size--;

        return removedNode.value;
    }

    // Remove and return the element from the back of the deque
    removeRear() {
        if (this.isEmpty()) {
            console.log("Deque is empty");
        }

        const removedNode = this.tail;

        if (this.size === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        this.size--;

        return removedNode.value;
    }

    // Check if the deque is empty
    isEmpty() {
        return this.size === 0;
    }

    // Get the size of the deque
    getSize() {
        return this.size;
    }

    getDirectoryString() {
        let dirString = "/";
        let currNode = this.head;
        let hasRan = false;

        while (currNode) {
            if (!hasRan) {
                dirString = dirString.concat(currNode.value);
                hasRan = true;
            } else {
                dirString = dirString.concat("/" + currNode.value);
            }

            currNode = currNode.next;
        }

        return dirString;
    }

    getPrevDirectory() {
        let currNode = this.tail;

        if (currNode.prev != null) {
            return currNode.prev.value;
        } else {
            return "/";
        }
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
}

/*
// Create a new deque instance
const deque = new Deque();

deque.addFront("Documents");
deque.addRear("Photos");
deque.addFront("Games");
deque.addRear("Anime");

console.log(deque.removeFront());
console.log(deque.removeRear());

console.log(deque.getSize());
console.log(deque.getDirectoryString());
console.log(deque.getPrevDirectory());

deque.clear();

console.log(deque.isEmpty());
*/
