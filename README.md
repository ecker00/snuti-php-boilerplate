# Snuti PHP & Handlebars boilerplate

A PHP project template setup with Handlebars rendering on server and client side. To quickly build a web app with a PHP API and easy database integration. Automatically create and modify the database structure during development for fast itterations.

Only the files in the "live" folder is accessible to the public and should be set as nginx/apache site root, hiding all other works files. The Grunt configuration is an important part of this setup.

To see this template in action, check out the [Pålegg GitHub](https://github.com/ecker00/palegg) and the [Let's code]() on YouTube.

## Setup and config

1) Fork/clone this repo
```
git clone https://github.com/ecker00/snuti-php-boilerplate.git
```

2) Setup Grunt task manager (requires [node](https://nodejs.org), [npm](https://www.npmjs.com/get-npm)):
```
npm install -g grunt-cli
npm install
```

3) Install dependencies (requires [composer](https://getcomposer.org)):
```
composer install
```

4) Configure your webserver:

- **Cloud9 with a PHP & Apache container:**
  ```
  sudo nano /etc/apache2/sites-available/001-cloud9.conf
  ```
  Change 'DocumentRoot' to point to the `live` folder in your project.
  ```
  DocumentRoot /home/ubuntu/workspace/[your-project-name]/live
  ```

---

## Logging and debug

- **Cloud9 with a PHP & Apache container:**

  To see the PHP console run the following command in a terminal window
  ```
  tail -f /home/ubuntu/lib/apache2/log/error.log
  ```

---

## Thanks

That's all there is to it! You can use this as a base to start any fancy web project. The method is tried and proven to work well for us in production. It's even possile to make this a Wordpress plugin, and get the best (and worst) of two worlds.

Happy coding!