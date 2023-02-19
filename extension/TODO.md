## EasyMeasure Chrome Extension

Main goal is to implement an extension that will be used to convert all units on the current opened tab window with the options specified by the user.

How to monetize:
    Make it free with ability to donate author (me) some money

v0.1.0
- [x] Add __Buy me a coffee__ link button
    - [x] Fix link opening
- [x] Implement Regex to search all the numbers with it's unit specification
    - [x] Refine & improve the regex construction
- [x] Make a simple highlighter for those numbers & units
    - [x] With ignored tags
- [x] Develop options popup window
    - [x] Options saving 
    - [x] Merge options window with popup
- [x] Make regex dynamic and dependent on the specified options
    - [x] Fix the error with the 'undefined' value in regex object
    - [x] Add fractional numbers parsing in one character, i.e. ½, etc
- [x] Move to react based extension
    - [x] Fix the error in Convert button onClick, where chrome callback function didn't execute
- [ ] Refactor options window
    - [x] Fix number parsing errors
    - [ ] Fix options 'processOnPageLoading' setting loaded value
    - [x] Fix Delete button event propagation
    - Fix Delete button action - no matter which button clicked, only the last items gets deleted
        - [ ] The actual error not with the delete button action, but rather with re-rendering of the component after list item deleted
    - [x] Fix styling so that there will be none inconsistencies
    - [x] Fix error with checkboxes - they cannot be set to unchecked
    - [x] Add option for preferable way of inserting converted values 
- [x] Make it actually work
- [x] Fix error when single fraction specified: __1/2 teaspoon__ becomes __NaN ml__
- [x] __Critical Fix__: options saving and loading (error with the Chrome too many tries blah blah blah)
- [ ] Add functionality to convert feet and inches, i.e. 1'2", or 2`4``, etc
- [ ] Add functionality to convert space and volumetric measures, i.e. 1 x 2 in, or 2'' x 4'' x 4'', etc 
- [ ] Fix numbers rounding when value 2 displayed as 2.00 (toFixed)


v0.2.0
- [ ] Keep all the tags __in__ and __around__ numbers and units
- [ ] Manage state thru redux
- [ ] Add somewhat appealing UI
    - [ ] Come up with the UI/UX design solution for:
        - Options tab
        - Home tab 