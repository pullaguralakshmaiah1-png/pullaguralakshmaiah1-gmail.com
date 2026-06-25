import { PythonTopic } from "./types";

export const DEFAULT_TOPICS: PythonTopic[] = [
  {
    id: "basics",
    name: "Python Basics & Syntax",
    description: "Master variables, conditional execution, loops, type conversions, and operators.",
    icon: "FileCode",
    defaultQuestions: [
      {
        id: "b1",
        topic: "Python Basics & Syntax",
        difficulty: "Beginner",
        question: "What is the output of the following Python expression?",
        code: `x = 10
y = 3
print(x // y, x % y)`,
        options: ["3 1", "3.333 1", "3 0.333", "3.333 0"],
        correctIndex: 0,
        explanation: "The '//' operator is floor division (returns the division rounded down to an integer), so 10 // 3 is 3. The '%' operator is the modulo operator (returns the division remainder), so 10 % 3 is 1."
      },
      {
        id: "b2",
        topic: "Python Basics & Syntax",
        difficulty: "Beginner",
        question: "Which of the following is NOT a valid variable name in Python?",
        code: ``,
        options: ["_my_variable", "my_var_2", "2_my_var", "MyVar"],
        correctIndex: 2,
        explanation: "In Python, variable names cannot start with a number. They must start with a letter (a-z, A-Z) or an underscore (_)."
      },
      {
        id: "b3",
        topic: "Python Basics & Syntax",
        difficulty: "Intermediate",
        question: "What is the result of comparing these string objects in Python?",
        code: `a = "Python"
b = "".join(["Py", "thon"])
print(a is b, a == b)`,
        options: ["True True", "False True", "True False", "False False"],
        correctIndex: 1,
        explanation: "The '==' operator checks if the values are equal (which they are, both represent the string 'Python'). The 'is' operator checks if they point to the exact same object in memory. Since 'b' was constructed dynamically, it is a separate object, so 'a is b' is False."
      },
      {
        id: "b4",
        topic: "Python Basics & Syntax",
        difficulty: "Intermediate",
        question: "What will the following code print?",
        code: `for i in range(3):
    print(i)
else:
    print("Done")`,
        options: [
          "0\n1\n2",
          "0\n1\n2\nDone",
          "Done",
          "SyntaxError: 'else' cannot be paired with 'for'"
        ],
        correctIndex: 1,
        explanation: "Python supports an 'else' block for loops. The 'else' block executes when the loop finishes normally (without encountering a 'break' statement). Since this loop ran to completion, 'Done' is printed at the end."
      },
      {
        id: "b5",
        topic: "Python Basics & Syntax",
        difficulty: "Expert",
        question: "What is printed by this short-circuit logic code?",
        code: `a = []
b = "Python"
c = a or b
d = a and b
print(c, "and", d)`,
        options: ["Python and []", "[] and Python", "True and False", "Python and False"],
        correctIndex: 0,
        explanation: "In Python, empty structures (like an empty list '[]') are truthy-evaluated as False. The 'or' operator evaluates from left to right, returning the first truthy value or the last value if all are falsy; so 'a or b' returns 'b' ('Python'). The 'and' operator returns the first falsy value or the last value if all are truthy; so 'a and b' short-circuits and returns 'a' ('[]')."
      }
    ]
  },
  {
    id: "data_structures",
    name: "Data Structures & Types",
    description: "Deep dive into Lists, Tuples, Dictionaries, Sets, and slicing.",
    icon: "Database",
    defaultQuestions: [
      {
        id: "ds1",
        topic: "Data Structures & Types",
        difficulty: "Intermediate",
        question: "What is the output of this slice on a nested list?",
        code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8]
sub = numbers[1:6:2]
print(sub)`,
        options: ["[2, 4, 6]", "[1, 3, 5]", "[2, 3, 4, 5, 6]", "[2, 5]"],
        correctIndex: 0,
        explanation: "The slicing syntax is [start:stop:step]. Index 1 is 2. We stop before index 6 (7). With a step of 2, we pick index 1 (2), index 3 (4), and index 5 (6). So, the output is [2, 4, 6]."
      },
      {
        id: "ds2",
        topic: "Data Structures & Types",
        difficulty: "Intermediate",
        question: "What is the classic behavior of a mutable default argument in Python?",
        code: `def add_item(item, box=[]):
    box.append(item)
    return box

print(add_item(1))
print(add_item(2))`,
        options: ["[1]\n[2]", "[1]\n[1, 2]", "[1]\n[]", "Error: default argument cannot be mutable"],
        correctIndex: 1,
        explanation: "In Python, default arguments are evaluated once at function definition time, not on every function call. Therefore, the same list 'box' is shared across all function calls that omit the second argument. The first call appends 1 to the default list. The second call appends 2 to the same shared list, returning [1, 2]."
      },
      {
        id: "ds3",
        topic: "Data Structures & Types",
        difficulty: "Expert",
        question: "What happens when you use an unhashable type as a dictionary key or in a set?",
        code: `my_dict = {}
my_dict[[1, 2]] = "list"`,
        options: [
          "The dictionary is created with keys as strings",
          "TypeError: unhashable type: 'list'",
          "SyntaxError: invalid syntax",
          "Successfully sets dictionary key to [1, 2]"
        ],
        correctIndex: 1,
        explanation: "Dictionary keys must be hashable. Mutable types like lists, dictionaries, and sets are not hashable because their contents can change over time. Using a list as a key raises a 'TypeError: unhashable type: 'list''."
      },
      {
        id: "ds4",
        topic: "Data Structures & Types",
        difficulty: "Beginner",
        question: "Which of the following data types in Python is immutable?",
        code: ``,
        options: ["List", "Dictionary", "Set", "Tuple"],
        correctIndex: 3,
        explanation: "A Tuple is an immutable sequence in Python. Once a tuple is created, its elements cannot be changed, added, or removed. Lists, Dictionaries, and Sets are all mutable."
      },
      {
        id: "ds5",
        topic: "Data Structures & Types",
        difficulty: "Intermediate",
        question: "What is the output of the following set operation?",
        code: `a = {1, 2, 3}
b = {3, 4, 5}
print(a ^ b)`,
        options: ["{3}", "{1, 2, 4, 5}", "{1, 2, 3, 4, 5}", "SyntaxError"],
        correctIndex: 1,
        explanation: "The '^' operator represents the symmetric difference of two sets. It returns elements that are in either of the sets, but not in both. Since 3 is in both, the symmetric difference is {1, 2, 4, 5}."
      }
    ]
  },
  {
    id: "oop",
    name: "Object-Oriented Python",
    description: "Explore classes, inheritance, super(), magic methods, and encapsulation.",
    icon: "Network",
    defaultQuestions: [
      {
        id: "oop1",
        topic: "Object-Oriented Python",
        difficulty: "Intermediate",
        question: "What will this basic inheritance and override print?",
        code: `class Parent:
    def greet(self):
        return "Parent"

class Child(Parent):
    def greet(self):
        return super().greet() + " & Child"

c = Child()
print(c.greet())`,
        options: ["Child", "Parent & Child", "Parent", "AttributeError"],
        correctIndex: 1,
        explanation: "The Child class overrides 'greet()', but it calls the parent implementation using 'super().greet()', which returns 'Parent'. It then appends ' & Child', yielding 'Parent & Child'."
      },
      {
        id: "oop2",
        topic: "Object-Oriented Python",
        difficulty: "Expert",
        question: "How does Python resolve name mangling for private attributes?",
        code: `class Secret:
    def __init__(self):
        self.__code = "1234"

s = Secret()
# How can we access __code from outside?`,
        options: [
          "s.__code",
          "s.Secret__code",
          "s._Secret__code",
          "It is completely impossible to access outside"
        ],
        correctIndex: 2,
        explanation: "In Python, class attributes starting with a double underscore (and not ending with double underscore) are name-mangled to prevent subclasses from overriding them. They are internally rewritten to '_ClassName__attributeName'. So, '__code' in 'Secret' is accessible outside via 's._Secret__code'. This shows that private attributes in Python are not strictly private, just obfuscated."
      },
      {
        id: "oop3",
        topic: "Object-Oriented Python",
        difficulty: "Intermediate",
        question: "What is the purpose of the '__str__' magic method in a Python class?",
        code: ``,
        options: [
          "To securely hash the object's instance variable values",
          "To return an official string representation for developers (via repr())",
          "To convert any object attribute to a string type safely",
          "To define a user-friendly string representation of the object (via print())"
        ],
        correctIndex: 3,
        explanation: "The '__str__' method is called by the 'str()' built-in function and by the 'print()' function to compute the 'informal' or user-friendly string representation of an object."
      },
      {
        id: "oop4",
        topic: "Object-Oriented Python",
        difficulty: "Expert",
        question: "What is the Method Resolution Order (MRO) outcome of this diamond inheritance?",
        code: `class A:
    def name(self): return "A"

class B(A):
    def name(self): return "B"

class C(A):
    def name(self): return "C"

class D(B, C):
    pass

print(D().name())`,
        options: ["B", "C", "A", "TypeError: Cannot create a consistent MRO"],
        correctIndex: 0,
        explanation: "Python uses the C3 Linearization algorithm to determine the Method Resolution Order (MRO). For class D inheriting from (B, C), the search order is D -> B -> C -> A. Since B implements 'name()', it is resolved first, printing 'B'."
      }
    ]
  },
  {
    id: "advanced",
    name: "Advanced & Functional Python",
    description: "Decorators, generators, closures, scope resolution, and iterators.",
    icon: "Cpu",
    defaultQuestions: [
      {
        id: "adv1",
        topic: "Advanced & Functional Python",
        difficulty: "Intermediate",
        question: "What is the value of 'x' after executing this local/global scoping code?",
        code: `x = 10

def change_it():
    global x
    x = 20
    
change_it()
print(x)`,
        options: ["10", "20", "UnboundLocalError", "None"],
        correctIndex: 1,
        explanation: "By declaring 'global x' inside the function, we tell the Python compiler that references and assignments to 'x' within 'change_it' should target the global module-level variable 'x'. Thus, 'x = 20' changes the global 'x' successfully, and printing it outputs 20."
      },
      {
        id: "adv2",
        topic: "Advanced & Functional Python",
        difficulty: "Expert",
        question: "What is the output of this lazy-evaluated generator function?",
        code: `def my_gen():
    yield 1
    yield 2
    return 3

g = my_gen()
print(next(g))
print(next(g))
try:
    print(next(g))
except StopIteration as e:
    print("Error:", e.value)`,
        options: [
          "1\n2\n3",
          "1\n2\nError: None",
          "1\n2\nError: 3",
          "1\n2\nStopIteration: 3"
        ],
        correctIndex: 2,
        explanation: "When a generator function executes a 'return' statement, the generator raises a 'StopIteration' exception. The value returned by the 'return' statement is passed as the argument to the 'StopIteration' constructor, and is available in the exception object's '.value' property. Thus, it prints 1, 2, and then 'Error: 3'."
      },
      {
        id: "adv3",
        topic: "Advanced & Functional Python",
        difficulty: "Expert",
        question: "What does this nested scope closure print when the inner function is evaluated?",
        code: `def outer():
    funcs = []
    for i in range(3):
        funcs.append(lambda: i)
    return funcs

results = [f() for f in outer()]
print(results)`,
        options: ["[0, 1, 2]", "[2, 2, 2]", "[3, 3, 3]", "SyntaxError"],
        correctIndex: 1,
        explanation: "Python's closures bind variables, not values. The lambda functions in the list refer to the variable 'i' from the enclosing scope. By the time the loop ends and the functions are called, 'i' has reached its final value of 2. Therefore, calling each function returns the current value of 'i', which is 2, producing [2, 2, 2]."
      }
    ]
  }
];
