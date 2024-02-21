As a web developer, I haven't worked much with a systems language, like C or Rust - but I've always wanted to, and I know many other web devs feel the same.

I thought a fun project to work on would be to implement a simple web server, without the help of any libraries like those provided by Node.js. During my time at RC I was finally able to make this a reality, and learned that, while challenging, it wasn't too difficult to implement.

I found a helpful blog post titled [Making a simple HTTP webserver in C](https://bruinsslot.jp/post/simple-http-webserver-in-c/) by Jan Pieter Bruins Slot, and used it as the basis for much of the code here, but followed along with my own notes and tangents to fill in some of my own knowledge gaps.

In simplest terms, [[A server is a program that provides data to other programs]]. This is how I originally learned to write a server in Node.js:


```javascript
// Import the built-in http module
const http = require('http');

// Define a port number where the server will listen to incoming http requests
const PORT = 8080;

// Define a function to handle the incoming http requests
const requestHandler = (request, response) => {
  // Write the http response status code and headers
  response.writeHead(200, { 'Content-Type': 'text/html'});

  // Write the http response content
  response.write('<html>Hello, world</html>');
  
  // End the response process 
  response.end(); 
}

// "Magic" the http server into existence, using the requestHandler function we just wrote as our callback
const server = http.createServer(requestHandler);

// Instruct the server to start listening on the specified port
server.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});

```

It's a relatively simple way to create an http server that is convenient. It gets even more convenient if you use a framework like express.js:

```javascript
const express = require('express');
const PORT = 8080;

// "Magic" the http server into existence
const app = express();

// Define a route for GET requests
app.get('/', (req, res) => {
  res.status(200).send('<html>Hello, world</html>');
});


// Instruct the server to start listening on the specified port
app.listen(PORT, () => {
 console.log(`Server is running and listening on port ${PORT}`);
});

```


The ability to magic--sorry, "instantiate"--a server into existence is hugely convenient. However, the benefits of working with an abstraction are balanced with the knowledge we lose. but whenever we work with abstractions of as engineers we have a habit of poking around black boxes and seeing how they work, and we often come away with a deeper knowledge and appreciation of the whole. After all, "real programmers" don't work with such high level abstractions. 

I've always been curious to learn more. As software engineers, we are always working with abstractions. Sometimes it can be useful to go deeper into the abstraction. 

For instance, what happens when we write:

`const server = http.createServer(requestHandler);`

We are using Node.js's http module, but what is that? It isn't plain JavaScript, it's an external library. In fact, we can't run system calls like this within plain JavaScript. Under the hood, this relies on the [`libuv`](https://libuv.org/) library. What is libuv? Without getting too much into the weeds, libuv is a library which extends the functionality of the Javascript code we write to allow us to do things like I/O and access to TCP
# The C server

To create a server in C, we need to first understand sockets. A socket is a fundamental concept in networking.  [[Sockets let you read and write data to a network connection.]] It is an abstraction that the operating provides you, much like a file. This turns out to be a useful abstraction, because in Unix, "everything is a file". The difference is, you can write some text to a file, and save it on your computer, whereas with a socket, you write some data to a network connection rather than to your hard drive.

Just as you can create a new text file and write to it, you can similarly create a new socket and write to it.

On the other end of the socket is another program that "listens" for the data coming in from the socket.

How does the program know where to listen? The same you share location in many contexts - using an address. 

In this case, a socket address. A socket address is commonly identified to other programs with a few pieces of data:
1. IP address (127.0.0.1)
2. port number (8080)

And this is exactly what we are doing when we "create" a server at http://127.0.0.1:8080

Knowing this, here are the general steps we follow in order to do this in C:

1. Create a socket
	- Make the relevant system call to create a socket
	- Specify socket type
	- Specify protocol
2. Bind the socket to an address and port
	-  Assign a specific IP address and port number to the socket
3. Put the socket in a "listen" state
	- Make another system call to instruct the operating system to listen for incoming connections requests 
	- The OS then sets up a queue for incoming connections
4. Accept and handle connections

Let's start with a simplified version of our code, focusing on the core functionality:
1. Create the socket
```C
  int sockfd = socket(AF_INET, SOCK_STREAM, 0); // Socket descriptor
```
- Here, we're ~~magicing~~ initializing a new socket, using the `socket` function. 
- The function returns a value, which is the file descriptor of the socket. We assign it to a variable `sockfd`
- The function parameters are a little confusing, but if we look at the docs man pages (`man socket` in Linux): `int socket(int domain, int type, int protocol);` This means we need to specify the socket domain, type, and protocol. Easy(ish)!
- The arguments we pass in are `AF_INET` means that the socket will use IPv4 internet protocols, `SOCK_STREAM` specifies the type of socket; a stream socket which is commonly used for TCP, and `0` is used to select TCP

2. Bind the socket to an address and port
```C
struct sockaddr_in host_addr;

int host_addrlen = sizeof(host_addr); // Get size in bytes of host_addr struct for later use 
host_addr.sin_family = AF_INET; // IPv4 address family
host_addr.sin_port = htons(PORT); // Convert port number to network byte order
host_addr.sin_addr.s_addr = htonl(INADDR_ANY); // Listen on any IP address
if (bind(sockfd, (struct sockaddr *)&host_addr, host_addrlen) != 0) { perror("webserver (bind)"); return 1; }
```
- In these lines we're setting up a `struct sockaddr_in` in which we're specifying an IP address and port number to be used for our network socket 
- A `struct` is similar to an object/hash map, and we're declaring one named `host_addr` of type `sockaddr_in`. We also get this value from the man pages (`man ip`).
- We are then assigning values to the various member variables (i.e. "object properties") of our new `host_addr` struct; family is IPv4, port is 8080, and address is any IP address. The `sin_` prefix is shorthand for "socket internet" or "sockaddr internet". And the `htons` ("host to network short") function converts integer values from host byte order to network byte order (little-endian to big-endian).


3. Put the socket in a "listen" state
```C
  // Listen for incoming connections
  if (listen(sockfd, SOMAXCONN) != 0) {
    perror("webserver listen");
    return 1;
  }
```
Here we're setting up the socket to listen for incoming connections with the `listen` function. We pass in the `sockfd` (socket file descriptor) argument, and `SOMAXCONN` which is a constant that represents the maximum size of the queue of pending connections for a socket.

4. Accept and handle connections

```C

char buffer[BUFFER_SIZE];
char resp[] = "HTTP/1.0 200 OK\r\n" "Server: webserver-c\r\n" "Content-type: text/html\r\n\r\n" "<html>hello, world</html>\r\n";

while (1) {
    struct sockaddr_in client_addr; // Define client address structure
    socklen_t client_addrlen = sizeof(client_addr); // Length of client address

    // Accept incoming connections
    int newsockfd = accept(sockfd, (struct sockaddr *)&client_addr, &client_addrlen);
    if (newsockfd < 0) {
      perror("webserver accept");
      continue;
    }
    printf("connection accepted\n");

    // Read data from the socket
    int valread = read(newsockfd, buffer, BUFFER_SIZE);
    if (valread < 0) {
      perror("webserver read");
      continue;
    }

    // Send response to the client
    int valwrite = write(newsockfd, resp, strlen(resp));
    if (valwrite < 0) {
      perror("webserver write");
      continue;
    }
    close(newsockfd); // Close the connection
  }
  return 0;
}
```
Lastly, we accept incoming connections using the `accept` function, which creates a new socket for each connection. We read data from the connection, send an HTTP response, and then close the connection.

And that's it! Not as straightforward as the Node.js solution, but fun nonetheless!

Here is the code in its entirety:
```C
#include <stdio.h>
#include <errno.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>

#define PORT 8080
#define BUFFER_SIZE 2048

int main() {

  char buffer[BUFFER_SIZE];
  char resp[] = "HTTP/1.0 200 OK\r\n"
                  "Server: webserver-c\r\n"
                  "Content-type: text/html\r\n\r\n"
                  "<html>hello, world</html>\r\n";
  // create socket
  int sockfd = socket(AF_INET, SOCK_STREAM, 0);
  if (sockfd == -1) {
    perror("webserver (socket)");
    return 1;
  }
  printf("socket created successfully\n");

  // create addr to bind socket to
  struct sockaddr_in host_addr;

  int host_addrlen = sizeof(host_addr);

  host_addr.sin_family = AF_INET;
  host_addr.sin_port = htons(PORT);
  host_addr.sin_addr.s_addr = htonl(INADDR_ANY);

  // bind socket to the addr
  if (bind(sockfd, (struct sockaddr *)&host_addr, host_addrlen) != 0) {
    perror("webserver (bind)");
    return 1;
  }

  printf("socket successfully bound to address\n");

  // listen for incoming connections
  if (listen(sockfd, SOMAXCONN) != 0) {
    perror("webserver listen");
    return 1;


  }
  printf("server listening for connections\n");

  while (1) {
    // accept incoming connections
    int newsockfd = accept(sockfd, (struct sockaddr *)&host_addr, (socklen_t *)&host_addrlen);
    if (newsockfd < 0) {
        perror("webserver accept");
        continue;
    }
    printf("connection accepted\n");

    // read from the socket
    int valread = read(newsockfd, buffer, BUFFER_SIZE);
    if (valread < 0) {
       perror("webserver read");
       continue;
    }

    // write to socket
    int valwrite = write(newsockfd, resp, strlen(resp));
    if (valwrite < 0) {
      perror("webserver write");
      continue;
    }
    close(newsockfd);
  }
  return 0;
 }
```

