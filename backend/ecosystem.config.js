module.exports = {
  apps: [{
    name: 'count-backend',
    script: './src/server.js',
    cwd: '/root/CountCount/backend',
    env: {
      NODE_ENV: 'production',
    },
  }]
}
