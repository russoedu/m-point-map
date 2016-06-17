
[toc]


# Map - moblet example

This is a moblet example created for Moblets. Developers can use this moblet to better understand how to create their own.

For other moblets, please access [Moblets' GitHub page](https://github.com/moblets/).

## Moblets
Moblets' name comes from _Mobile_ + _Widgets_. It's a project created to simplify the creation of mobile apllications. Apps created with Moblets structure are used in [FabApp](http://fabapp.com) CMS.

## Structure
As Moblets is based on Apache Cordova, the apps are hybrid and it's moblets are created with HTML, CSS and JavaScript. Moblets' apps have a base prepared to receive a predefined structure and work with it.

This is the folder structure of m-map moblet:

```
0      m-map
1      ├── moblet
1.1    |   ├── lang
1.1.1  |   |   ├── en-US.json
1.1.1  |   |   └── pt-BR.json
1.2    |   ├── m-map.html
1.3    |   ├── m-map.js
1.4    |   └── m-map.scss
2      ├── server
2.1    |   ├── changelog
2.1.1  |   |   └── en-US.md
2.2    |   ├── helper
2.2.1  |   |   ├── pt-BR.md
2.2.2  |   |   └── example-image.gif
2.3    |   ├── lang
2.3.1  |   |   ├── en-US.json
2.3.1  |   |   └── pt-BR.json
2.4    |   ├── form.json
2.5    |   ├── feed.js
2.6    |   └── icon.svg
3      ├── spec
3.1    |   ├── support
3.1.1  |   |   └── jasmine.json
3.2    |   └── feed-spec.js
4      ├── .gitignore
5      ├── package.json
6      └── readme.md
```
Now we'll go through each file and folder to explain them. Names inside brackets (e.g. [moblet]) need to have this exact name so the moblet is validated in our backend.

### 0. m-map folder
This is your root directory. This folder name is not validated and doesn't need to be unique, so, you can call your Moblet whatever you want.

### 1. [moblet]
This folder is where you'll store the app frontend files. These files will be injected into the app.

### 1.1 [lang]
This is the folder where you store the app localization files. You need at least one locale so the moblet is validated.

### 1.1.1 pt-BR.json and en-US.json
These are the localization JSON files used by the moblet to display the content in distinct languages.

The name of these JSONs follow the convention "language" in lower case, followed by an hyphen and, finally, the country code in uppercase.

Inside these JSON files, we have each string that needs translation.

**The keys must use [snake case] format.**

 These strings are called from the moblet JavaScript using the $filter function:

e.g.


    $filter('translate')("reward_confirm")


### 1.2 m-map.html
This is the moblet HTML used to display the moblet content in the app.

This file name must match the name passed through the Moblet Upload System and **must be unique** inside Moblets.

This is an [AngularJS directive](https://docs.angularjs.org/guide/directive) HTML.

### 1.3 m-map.js
This is the moblet JavaScript used for the Moblet's business logic.

This file name must match the name passed through the Moblet Upload System and **must be unique** inside Moblets.

This is an [AngularJS directive](https://docs.angularjs.org/guide/directive) JavaScript.

This file must use the ```restrict: 'E'``` convention so it will create an **element**.

You can better understand a moblet creation in the [final section of this readme](#tutorial-to-create-a-moblet).

### 1.4 m-map.scss
This is the moblet CSS used for the Moblet's business logic. You can use CSS, SCSS or SASS for this.

This file name must match the name passed through the Moblet Upload System and **must be unique** inside Moblets.

The styles used in the moblet can overwrite Moblets's styles, but they will only affect the moblet context.

### 2. [server]
This folder is where you'll store the app backend files. These files will be used into the FabApp CMS when some app creator insert the moblet into their app.

### 2.1 [changelog]
This folder is where you'll store the changes made for each moblet version you create, so app creators can see what's new in each version and decide if they want to update their app with a new version.

In this folder you can store localized Markdown files and images.

### 2.1.1 pt-BR.md and en-US.md
These are Markdown files describing each version that will display a rendered HTML when an app creator clicks (ver.) in the FabApp CMS.

The name of these Markdowns follow the convention "language" in lower case, followed by an hyphen and, finally, the country code in uppercase.

### 2.2 [helper]
This folder is where you'll store the helper of your moblet, so app creators can better use it.

In this folder you can store localized Markdown files and images.

### 2.2.1 pt-BR.md and en-US.md
These are Markdown files that will display a rendered HTML when the app creator clicks on the (?) in the FabApp CMS.

The name of these Markdowns follow the convention "language" in lower case, followed by an hyphen and, finally, the country code in uppercase.

### 2.2.2 images
These are images used in the helper Markdown. It's used by a relative path.

### 2.3 [lang]
This is the folder where you store the app localization files. You need at least one locale so the moblet is validated.

### 2.3.1 pt-BR.json and en-US.json
These are the localization JSON files used by the FabApp CMS to display the moblet configuration content in distinct languages.

The name of these JSONs follow the convention "language" in lower case, followed by an hyphen and, finally, the country code in uppercase.

Inside these JSON files, we have a structure of objects for each data of the moblet.

The first object, ```moblet```, is mandatory and must use this name and have all these fields:

```
"moblet": {
    "label": "Fidelity Card",
    "hint": "Create a fidelity card to your customers",
    "description": "Fill out the form below to create the fidelity card"
}
```
These fields are used by the FabApp CMS to display the basic moblet informations as shown in the image below:

**Moblet label, hint and icon in the Moblets list**<br>
![Moblet label, hint and icon](https://i.imgur.com/1TkTq3J.png "Moblet label, hint and icon")

**Moblet label, icon and description in the Moblet configuration pannel**<br>
![Moblet label, icon and description](https://i.imgur.com/iCaFaZ0.png "Moblet label, icon and description")

The other fields are directly related to the **form.json** file. Each field in this file has an object in the JSON.

For instance, in the form.json, we have this field:

```
{
    "name": "description",
    "type": "text-area"
},
```

In the translation file, we have a label, a hint and a placeholder for this field:

```
"description": {
    "label": "Card description",
    "hint": "This is the text that will be in the top of your card",
    "placeholder": "Lunch 9 times and the 10th is free!!!"
}
```

**Field label, placeholder and description**<br>
![Field label, placeholder and description](https://i.imgur.com/Z5j3SGZ.png "Field label, placeholder and description")

**The keys must use [snake case] format.**

//TODO: describe each possibility in this translation file

### 2.4 [form.json]
This JSON is used by the FabApp CSM to build the moblet configurations an data form.

It's a group of objects inside the _fields_ object. Each object describes a moblet field.

It's mandatory for each field to have a **name** and a **type**.

The **name** must be a [snake case] string that will be used as key to the localization JSONs.

The **type** must be one of the followig HTML input types:

| Text type fields  | Other type of fields      | Date type fields      |
| ----------------- | ------------------------- | --------------------- |
| text              | file                      | date                  |
| text-area         | image                     | time                  |
| number            | checkbox                  |                       |
| password          | radio                     |                       |
| email             | color                     |                       |
| tel               |                           |                       |


Some types need specific data that are better explained in the Moblets development documentation. All the fields have automatic validation to check if the filled content matches the expected type. For instance, you can't upload a text in an image field or, a text in an email field.

The other data in this JSON are relative to the field validation. You can use the following validations and, to better understand them, check the Moblets development documentation.

You can check all possible validation types in [m-validate](https://github.com/moblets/m-validate) project, that is used to create FabApp validations.

### 2.5 [feed.js]
This file is used by the server to serve the feed for the moblet. Moblets App-API and NorMA use this [NodeJs] file to get the data needed by the moblet.

The ```feed``` function is mandatory and receive as param the stored config in the DB.

This function must return a JSON with the content used by the app module of the moblet.

You can use any [NodeJs] module. Just use ```npm install --save```so the module is added to the ```package.json``` file.

### 2.6 [icon.svg]
This is the icon used in the FabApp CMS to display the moblet. It's also the default moblet icon, if the app creator don't choose a specific icon.

### 3 [spec]
This folder and it's structure is created by [Jasmine] test framework. To create this structure, you'll have to install [Jasmine] with ```npm install -g jasmine``` and run ```jasmine init``` in your moblet root folder.

### 3.1 [support]
Mandatory folder containing the [Jasmine] configuration files.

### 3.1.1 [jasmine.json]
This is [Jasmine] configuration file. You don't have to change this file.

### 3.2 [feed-spec.js]
This is where the [Jasmine] test code is created.

### 5. [gitignore]
You must add ```node_modules``` to gitignore, so, when submiting your moblet do FabApp the modules are not in your Git repository.

### 5. package.json
This is the file created by [NodeJs]. You only need this file if you are using a Node module in your moblet.

### 6. readme.md
This file is where you'll describe your moblet. It's very important if your moblet is Open Source, so other developers can betther understand it and contribute.

##Tutorial to create a moblet<a id="tutorial-to-create-a-moblet"></a>


To begin understanding how to create a moblet, let's take a look in the moblet (m-map/moblet) folder. All theses files will be embeded in the app in a single bundle created by Moblet's [m-forge].

Open ```m-map/moblet/m-map.js```, ```m-map/moblet/m-map.html``` and ```m-map/moblet/m-map.scss```.

### Directive
Moblets are [AngularJs] **element directives**, as you can see in ```m-map.js``` begining. This means a moblet is injected in the app as an element in it's HTML and that's why the SCSS has all it's options inside a single m-map element.

```javascript
require('./m-map.scss');
.
.
.
angular.module("uMoblets")
  .directive('mMap', function($uInjector) {
    return {
      restrict: 'E',
      template: fs.readFileSync(path.join(__dirname, 'm-map.html'), 'utf8'),
```

The directive is called **mMap** and the element is it's hyphen case version, **m-map**.

In the begining of this JavaScript code we inject the CSS – ```require('./m-map.scss')``` - [m-forge] compiles this SCSS into a CSS – , tell AngularJs it's an **Element** directive – ```restrict: 'E'```–  and set the path of the HTML template – ```template: fs.readFileSync(path.join(__dirname, 'm-map.html'), 'utf8')```.

### Directive link
In this moblet, we use the **directive link** to inject an external JavaSript (Google Maps' JavaScript) tha will be used in it's **controller**.

```javascript
link: function() {
    $uInjector.inject("http://maps.google.com/maps/api/js" +
      "?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true");
  },
```

We use **$uInjector** to inject the JS and then we'll see a function that holds the exection until this injection has finished loading.

This will create a script tag that will be added to the HTML when the moblet runs:

    <script src="http://maps.google.com/maps/api/js?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;amp;sensor=true"></script>

### Directive controller

The controller is where all the moblet logic resides. From displying data in the HTML view, to the communication with NoRMA and your feed (using your **server/feed.js** file).

First, we call the controller function with all the needed parameters we'll use in the moblet:

```javascript
controller: function(
    $scope,
    $uMoblet,
    $uFeedLoader,
    $filter,
    $ionicScrollDelegate,
    $uAlert,
    $timeout
  ) {
```

### The init function
In line 259, we call ```init();```, that will run all the needed stuff to load the moblet.

Let's take a look in the ```init``` function:

```javascript
var init = function() {
  $scope.isLoading = true;
  $scope.moblet = $uMoblet.load();
  $uFeedLoader.load($scope.moblet, 1, false)
    .then(function(data) {
      // Put the data from the feed in the $scope object
      $scope.mapData = data;
      // Split the screen in two portions. The map is 90% and the
      // "show list" button 10%. The list and the "show map" botton
      // are 0%
      $scope.mapHeight = computeFactorHeight(90);
      $scope.listHeight = computeFactorHeight(0);
      $scope.zoomMapButtonHeight = computeFactorHeight(0);
      $scope.zoomListButtonHeight = computeFactorHeight(10);

      // Set the Ionic scroll javascript to the list of locations
      // You need to set 'delegate-handle="listMapScroll"' on the
      // HTML
      $ionicScrollDelegate.$getByHandle('listMapScroll').resize();

      findCenter();
      loadMap();
    });
};
```

Let's break this code into parts to better understand it.

#### isLoading variable
The first thing we do is set the **$scope.loading** variable to ```true```, so the moblet is covered with a loading screen while loading. We'll change it to ```false``` after the moblet has finished loading.

In [AngularJs], the $scope variable is **global** and can be accessed by any part of the application and the HTML using specific tags and functions.

#### moblet variable

We set the **moblet** variable using a Moblets function called ```$uMoblet.load()``` and it contains the data needed to load the moblet feed:

```json
{
    mobletType: "google_map",
    proxy: "http://proxy.universo2.local/moblets/",
    id: "9",
    jsonUrl: "http://proxy.universo2.local/moblets/9.json"
}
```

The **jsonUrl** is the URL of the feed, the response of the ```server/feed.js``` [NodeJs] file.

For instance, in this case, calling this URL will responde with the following Json:

```json
{
    mapTypeId: "ROADMAP",
    locations: [
        {
            address: "Av. Faria Lima, 2534",
            title: "Faria Lima",
            latitude: "-23.597245",
            longitude: "-46.821253"
        },
        {
            address: "Av. Rebouças, 300",
            title: "Revouças",
            latitude: "-23.629766",
            longitude: "-46.721441"
        }
    ],
    mapTypeControl: false,
    streetViewControl: false,
    panControl: false,
    rotateControl: false,
    zoomControl: false
}
```

This is the Json answered by the feed created by us for this moblet.

#### Loading the feed

As we now know the moblet feed URL, we call it using the **$uFeedLoader.load** function. The parameters are **the moblet object**, the **page** (1, as we have only one pae in this case) and if we'll use the **local storage caché** instead of loading the feed.

After the data is loaded, the **.then** is called with the feed response (the **data** object).

As we'll use this data all around the moblet, web put it in a global variable using ```$scope.mapData = data;```.

##### Setting the div heights

Now, let's take a look in the moblet HTML to understand how it's made and why we'll set the heights dinamically using Moblets' **u-make-frame-min-size** function.


```html
<u-moblet is-loading="isLoading" init="init" inner-scroll="true">
  <div id="wraper" u-make-frame-min-size >
    <div id="zoom-map" class="zoom-button" ng-style="{'height':zoomMapButtonHeight}" ng-click="zoomMap()">
      <div class="zoom-buttom-wraper" ng-style="{'height':zoomMapButtonHeight}">
        <p translate="zoom_map"></p>
      </div>
    </div>
    <div id="m-map-{{moblet.id}}" class="map" ng-click="zoomMap()" ng-style="{'height':mapHeight}"></div>
    <div id="zoom-list" class="zoom-button" ng-style="{'height':zoomListButtonHeight}" ng-click="zoomList()">
      <div class="zoom-buttom-wraper" ng-style="{'height':zoomListButtonHeight}">
        <p translate="zoom_list">
      </div>
    </div>
    <ion-scroll overflow-scroll="false" delegate-handle="listMapScroll" ng-style="{'height':listHeight}" ng-click="zoomList()">
      <div class="list">
          <div class="item item-icon-right" ng-repeat="(key, location) in mapData.locations">
            <h2>{{location.title}}</h2>
            <p>{{location.address}}</p>
            <i class="icon ion-ios-navigate" ng-click="openLocation(key)"></i>
          </div>
      </div>
    </ion-scroll>
  </div>
</u-moblet>
```





[MIME types]: https://www.iana.org/assignments/media-types/media-types.xhtml
[snake case]: https://en.wikipedia.org/wiki/Snake_case
[NodeJs]: https://nodejs.org/en/
[Jasmine]: http://jasmine.github.io/2.4/introduction.html
[m-forge]: https://www.npmjs.com/package/m-forge
[AngularJs]: https://angularjs.org
