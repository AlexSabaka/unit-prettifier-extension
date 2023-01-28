## EasyMeasure Chrome Extension

Main goal is to implement an extension that will be used to convert all units on the current opened tab window with the options specified by user.

How to monetize:
    - Limited converting units
    - TODO: Move parsing and converting functional to backaend - NodeJS

v0.1.0
- [x] Implement Regex to search all the numbers with it's unit specification
    - [ ] Refine & improve the regex construction
- [x] Make a simple highlighter for those numbers & units
    - [x] With ignored tags
    - [ ] With the ability to keep all the tags in and around numbers and units
- [x] Develop options popup window
    - [x] Options saving 
    - [x] Merge options window with popup
- [x] Make regex dynamic and dependent on the specified options
    - [ ] Fix the error with the 'undefined' value in regex object
    - [ ] Add fractional numbers parsing in one character, i.e. ½, etc
- [x] Move to react based extension
    - [ ] Fix the error in Convert button onClick, where chrome callback function didn't execute
    - [ ] Add somewhat appealing UI
- [ ] Refactor options window
    - [ ] Fix number parsing errors
    - [ ] Fix Delete button
- [ ] Make it actually work

v0.2.0
- [ ] Manage state thru redux
- [ ] Add payment capabilities (one time payment?)
