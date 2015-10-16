# Project Two - Donghwa - Jake's Forum

## This project implements the following technologies:
- HTML & CSS
- Javascript & jQuery
- Fonts from Google & Bootstrap
- mongoose
- node.js, express, express-ejs-layouts, & express-session
- body-parser & method-override
- bcrypt
- heroku & mongolab addon

## Required and optional features included in this Project:
**Required**
- Create, and discuss / comment by topics
- What topics have the most comments. Vote on topics and show by popularity
- Create usernames / logins
- Styling

**Advanced - Implemented**
- Sign up with a username - using bcrypt and also checking to see if the username is already in use, and requiring the user to enter the same password twice during registration process.
- Desktop and mobile friendly
- Also, not listed in the project description but includes: hamburger menu with animated menus, other sorting options (by date created, recently commented, and user topics), edit and delete topics (one's own), logging out, timestamping the topics and comments.

**Advanced - Not implemented**
- Commenting on comments
- Geolocation info
- Posts in markdown format

## Approach + how the forum was coded

## Simplified flow for forum:
- User logs in / registers
- User can create / edit & delete their topics
- User can comment on any topics
- User can sort topics by users, date created, last commented, number of comments and likes
- User can log out when finished

### Server.js:
- **variables and required elements:** various packages needed and schemas. There are two schemas, one for users and another for topics / comments.
- **server sets and uses:** requirements and default elements, etc.
- **server get, post, patch, and deletes:** various needed for the required pages and functionalities.  

### App.js:
- **animations:** javascript to control animations for new topic / comment and hamburger/sliding menu.

### Various .ejs files:
- **layout.ejs:** HTML (w/o body) and Nav / common elements
- **other .ejs files:** other pages

## Project URL:
https://pacific-lowlands-8150.herokuapp.com
https://github.com/donghwalee/project-two

## Unsolved Problems:
**Advanced - Not implemented**
- Commenting on comments
- Geolocation info
- Posts in markdown format

**Other features that I would like to implement**
- User preferences - various settings such as color, theme, etc. Also manage passwords (change, resets, forgotten, etc.), username, and further information such as emails, etc.
- Varying levels of user rights
- Send invitations
- Notifications (when somebody posts on your topic, replies to your comments, mentions you, etc.)
- Private and public forums
- Better formatting options for their users.
- Better coding/organization/optimization
- Better error handling

## Wireframes and user stories used:

![](https://app.box.com/shared/static/i1skcdj2brxij6acxceuy88ol523rbaf.jpg)

![](https://app.box.com/shared/static/lpnf9m50mp0apefar4ji3vqhb8afftj3.jpg)

![](https://app.box.com/shared/static/z4q6ip4ti5bz5ix5gyd6p5k8gemkojdx.jpg)

![](https://app.box.com/shared/static/d087vyep70x7dq5a7k2qm0ajev4vwdov.png)

![](https://app.box.com/shared/static/kvaxml7u2n9568yaipr1rrlyt0dde5fd.png)

![](https://app.box.com/shared/static/zoq9tp1a8ckj5ub876zty8ytfi23ftuy.png)

![](https://app.box.com/shared/static/x5dxm9ezqhja677yy5aj2pfme6fg4jz9.jpg)
