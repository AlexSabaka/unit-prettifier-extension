##UnitPrettifier Chrome Extension

Main goal is to implement an extension that will be used to convert all units on the current opened tab window with the options specified by user.

v1.0.0
- [x] Implement Regex to search all the numbers with it's unit specification
    - [ ] Refine & improve the regex construction
- [x] Make a simple highlighter for those numbers & units
    - [x] With ignored tags
    - [ ] With the ability to keep all the tags in and around numbers and units
- [x] Develop options popup window
    - [x] Options saving 
    - [ ] Merge options window with popup
- [x] Make regex dynamic and dependent on the specified options

v1.0.1
- [ ] Move to react based extension
- [ ] Manage state thru redux