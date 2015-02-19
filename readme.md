#React-Socket (Mixin)
A socket.io mixin for react.js components. Provides handlers that can be used for the react component lifecycle, and custom
connection/disconnection without losing client id.

This mixin presumes you have browserified both [lodash](https://github.com/lodash/lodash) and [socket.io-client](https://github.com/Automattic/socket.io-client).

###Todo:
- Document Methods in the Readme, as socket.io connections/reconnections aren't very sugary.
- Provide an example of use, both on the client side and server side.
