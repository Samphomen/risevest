# Use an official Node.js runtime as the base image
FROM node:18.17.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that your app will listen on
EXPOSE 5000

# Rebuild bcrypt to ensure compatibility
RUN npm rebuild bcrypt --build-from-source

# Command to start your Node.js app
CMD [ "node", "index.js" ]
