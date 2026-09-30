const app = require('./app');

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`John Move API en http://localhost:${PORT}`);
  });
}

module.exports = app;
