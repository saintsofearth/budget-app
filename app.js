var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };



    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.total[type] = sum;
    }

    return {

        addItem: function(type, des, val) {
            var newItem, ID;
            // create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if(type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if(type === "inc") {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },

        calculateBudget: function() {
            // 1. Calculate total income and expenses.
            calculateTotal("inc");
            calculateTotal("exp");
            // 2. Calculate the budget: income - expense
            data.budget = data.total.inc - data.total.exp;
            // 3. Calculate the percentage of income that we spent.
            if(data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp/ data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(expElement) {
                expElement.calcPercentage(data.total.inc);
            });

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }
        },

        getPercentages: function() {
            var allExpPer = data.allItems.exp.map(function(expElement) {
                return expElement.getPercentage();
            });
            return allExpPer;
        },

        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        testing: function() {
            console.log(data);
        }
    }
    
})();

var UIController = (function() {

    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetValue: ".budget__value",
        budgetIncValue: ".budget__income--value",
        budgetExpValue: ".budget__expenses--value",
        budgetExpPercentage: ".budget__expenses--percentage",
        container: ".container",
        expensePercLabel: ".item__percentage",
        monthLabel: ".budget__title--month"
    }

    var formatNumber = function(num, type) {

        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substring(0, int.length -3 ) + "," + int.substring(int.length - 3);
        }

        type === "exp" ? sign = '-' : sign = "+";
        return sign + " " + int + "." +dec;

    };

    var nodeListForEach = function(list, callback) {
        for(var i=0; i<list.length; i++) {
            callback(list[i], i);
        }
    };

    return {

        addListItem: function(obj, type) {
            var html, newHTML, element;
            // create HTML string with placeholder text
            if(type === "inc") {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === "exp") {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
         
            // Repalce the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        changedType: function() {
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.inputType + ", " +
                DOMStrings.inputDescription + ", " +
                DOMStrings.inputValue
            );
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle("red-focus");
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
        },

        displayBudget: function(budgetObj) {
            var type;
            budgetObj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMStrings.budgetValue).textContent = formatNumber(budgetObj.budget, type);
            document.querySelector(DOMStrings.budgetIncValue).textContent = formatNumber(budgetObj.totalInc, 'inc');
            document.querySelector(DOMStrings.budgetExpValue).textContent = formatNumber(budgetObj.totalExp, 'exp');
            if(budgetObj.percentage > 0) {
                document.querySelector(DOMStrings.budgetExpPercentage).textContent = budgetObj.percentage+"%";
            } else {
                document.querySelector(DOMStrings.budgetExpPercentage).textContent = "---";
            }
            
        },

        displayExpensePercentage: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);

            nodeListForEach(fields, function(currentNode, index) {
                if(percentages[index] > 0) {
                    currentNode.textContent = percentages[index] + "%";
                } else {
                    currentNode.textContent = "---";
                }
                
            });

        },

        displayMonth: function() {
            var now, year, month;

            now = new Date();

            year = now.getFullYear();

            month = now.getMonth();
            var months = [
                "January",
                "Feburary",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ]
            document.querySelector(DOMStrings.monthLabel).textContent = months[month] + " " + year;
        },

        deleteListItem: function(selectorId) {
            var element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },

        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }     
        },

        getTheDOMString: () => {
            return DOMStrings;
        }
    };
})();

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListener = function() {
        var DOM = UICtrl.getTheDOMString();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", (event) => {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    }
    var ctrlAddItem = function() {
        var input, newItem;

        // 1.get the filed input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2.add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            // 3.add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4.clear the fields
            UICtrl.clearFields();

            // 5. Update and calculate the budget.
            updateBudget();

            // 6. Update inc and exp percentage
            updatePercentage();
        }

        
    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        // console.log(event.target.parentNode.parentNode.parentNode.parentNode);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete an item from the datastructures
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from UI 
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. update the expense percentages
            updatePercentage();
        }
    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentage = function() {
        
        // 1. Calcuate the percentage
        budgetCtrl.calculatePercentage();

        // 2. Return the percentage
        var percentages = budgetCtrl.getPercentages();

        // 3. Display updated percentage on the UI
        UICtrl.displayExpensePercentage(percentages);
    }

    return {
        init: function() {
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListener();
        }
    }
})(budgetController, UIController);

controller.init();
