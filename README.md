# saldo-api
A simple api backend to do some banking.

This is a simple wrapper for the [sbanken API's](https://github.com/Sbanken/api-examples), 
using the [bridge pattern](https://en.wikipedia.org/wiki/Bridge_pattern) 
and/or [facade pattern](https://en.wikipedia.org/wiki/Facade_pattern) to be able 
to expose access to your account details in a safe way. This decouples my client 
API from the underlying SBanken API, and lets me encapsulate credentials and secrets 
to SBanken in a secure way. Instead of giving a web client direct access to credentials, 
as an example.

It uses my other repository [node-sbanken](https://github.com/tfmalt/node-sbanken) as the SDK to make the actual API requests.

## Running in Docker

The API Client is intended to be run as a docker container.

"""
docker run
"""
