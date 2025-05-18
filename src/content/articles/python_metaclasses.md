---
title: "Python Metaclasses using Network concepts"
date: 2025-02-23T20:54:50+01:00
draft: false
toc: false
images:
tags:
  - python
  - metaclasses
---
# Python - Metaclasses

- **Metaclasses are part of metaprogramming in Python**, used to define how other classes are constructed. They act as blueprints for creating classes, setting up patterns or rules that all classes derived from them must follow.
- **Metaclasses manage class behavior rather than instance behavior**. While a traditional class defines behaviors for its instances, a metaclass defines behaviors for classes it generates.
    - **Access to attributes and methods** is segregated by levels:
        - Classes created by a metaclass can access the metaclass's attributes and methods because they are instances of that metaclass.
        - Instances of those classes do not inherit from the metaclass directly. They only have access to what is defined in their own class structure or inherited from their class’s parent classes.
        - If needed, metaclass attributes or methods can be exposed to instances via explicit definitions within the class, such as class methods or properties.
    

```python
import logging

class Net_Inv_Meta(type): # Here is the Magic: the root level of Python objects is the type... type! A class is a "type" type.
    device_counter = {} #keep track of how many classes are created
    
    def __new__ (cls, name, bases, dct):
        new_class = super().__new__(cls, name, bases, dct) #__new__ allows to create new classes from the metaclass
        if name in ['Router', 'Switch', 'Firewall']:
            cls.device_counter[name] = cls.device_counter.get(name, 0) + 1
            Net_Inv_Meta.device_counter[name] = new_class
            logging.info(f"Registered {name} in Network Inventory")
        return new_class
    
    def __init__(cls, name, bases, dct): # Like any other classes __init__ is the constructor
        if 'configure_interface' not in dct or 'save_configuration' not in dct: # Validation: all the derived classes from the metaclass must have those methods implemented
            raise NotImplementedError(f"Class {name} must implement interface configuration and save configuration options") # otherwise we raise an error
        super().__init__(name, bases, dct) # the derived classes inherit built-in aspects from the metaclass using the super() function
        cls.setup_security_defaults(cls) 
        cls.vlan_management(cls)
        
    @staticmethod # static methods allows to query the method's attribute, even if they are inherited from metaclass and are not accessible by default
    def base_info(cls):
        cls.hostname = cls.__name__ # we use the name of class derived from the metaclass as the default hostname
        cls.interfaces = ['24', '48']
        
    @staticmethod
    def setup_security_defaults(cls):
        cls.password = 'Admin'
        cls.default_native_vlan = 'VLAN1'
        cls.vpn_enabled = False
        cls.log_changes = lambda message: logging.info(f"Configuration change in {cls.__name__}: {message}")
    
    @staticmethod
    def vlan_management(cls):
        cls.native_vlan = 'VLAN90'
        cls.log_changes = lambda message: logging.info(f"Configuration change in {cls.__name__}: {message}")
                
    def connect(cls):
        print(f"{cls.__name__} connecting using default method.")

    def disconnect(cls):
        print(f"{cls.__name__} disconnecting using default method.")

    def update_firmware(cls):
        print(f"{cls.__name__} updating firmware using default method.")    

class Router(metaclass=Net_Inv_Meta): # A class derived from metaclass definition
    
    @property # we use property to access value from a class's methods, if we don't use property we are pointed to the python object's id of the attribute that is like <function Net_Inv_Meta.vlan_management at 0x00000186E9731240> 
    def base_info(self):
        Net_Inv_Meta.base_info(self.__class__) # here is a trick: we can't use the super() function cause MRO doesn't allows us to access metaclass attributes... so we call the directly!
        return(f"Device {self.hostname} has {self.interfaces[1]} interfaces")
    
    def configure_interface(self):
        self.log_changes("Interfaces configured")
        return "Interfaces configured"

    def save_configuration(self):
        self.log_changes("Configuration saved")
        return 'Configuration saved'
    
    def connect(self):
        Net_Inv_Meta.connect(self.__class__)
        print(f"{self.__class__.__name__} establishing a VPN connection.")
            
    def update_firmware(self):
        Net_Inv_Meta.update_firmware(self.__class__)
                        
            
class Switch(metaclass=Net_Inv_Meta):
    
    @property
    def base_info(self):
        Net_Inv_Meta.base_info(self.__class__)
        return(f"Device {self.hostname} has {self.interfaces[0]} interfaces")
    
    def configure_interface(self):
        self.log_changes("Interfaces configured")
        return "Interfaces configured"

    def save_configuration(self):
        self.log_changes("Configuration saved")
        return 'Configuration saved'
        
    def connect(self):
        Net_Inv_Meta.connect(self.__class__)
        print(f"{self.__class__.__name__} establishing a VPN connection.")
    
    @property    
    def change_native_vlan(self):
        Net_Inv_Meta.setup_security_defaults(self.__class__)
        print(f"Default Native VLAN is {self.default_native_vlan}")
        Net_Inv_Meta.vlan_management(self.__class__)
        return (f"Native VLAN has changed to {self.native_vlan}") 
    
class Firewall(metaclass=Net_Inv_Meta):
    
    @property
    def base_info(self):
        Net_Inv_Meta.base_info(self.__class__)
        return(f"Device {self.hostname} has {self.interfaces[0]} interfaces")
    
    def configure_interface(self):
        self.log_changes("Interfaces configured")
        return "Interfaces configured"

    def save_configuration(self):
        self.log_changes("Configuration saved")
        return 'Configuration saved'
        
    def connect(self):
        Net_Inv_Meta.setup_security_defaults(self.__class__)
        print(f"VPN Enabled is {self.vpn_enabled}")
        print(f"{self.__class__.__name__} enabling and establishing a VPN connection.")
    

router1 = Router() # class instantiation. By MRO (Method Resolution Order) a class instance doesn't have access to the metaclass attributes. That's why we use some static methods and property feature.
switch1 = Switch()
firewall1 = Firewall()

print('\n')

router1.connect()
router1.update_firmware()
print(router1.base_info)

print('\n')

print(switch1.base_info)
switch1.connect()
print(switch1.change_native_vlan)

print('\n')

firewall1.connect()

print('\n')
print(Net_Inv_Meta.device_counter)
```

### Understanding Network Device Management with Python Metaclasses

### Introduction to Metaclasses

Metaclasses in Python are fundamentally classes of classes; they define how classes behave rather than instances. In the provided code, `Net_Inv_Meta` serves as a metaclass used to define a structure and behaviors for network devices like routers, switches, and firewalls. The magic of metaclasses is demonstrated by their ability to dynamically modify class creation, enforce method implementation, and track device registration across the network inventory system.

### Automatic Device Registry

The `device_counter` dictionary within the `Net_Inv_Meta` metaclass tracks the number of devices created for each type. Every time a new class is instantiated from `Router`, `Switch`, or `Firewall`, it automatically registers the device type in this dictionary. This not only keeps count but also logs the registration event using Python's logging module. This ensures that every device is accounted for and provides a simple yet effective way to monitor the types of devices currently managed by the system.

### Method Implementation Enforcement

One of the critical functionalities of this metaclass is ensuring that any class derived from it implements essential methods like `configure_interface` and `save_configuration`. If these methods are not defined, the metaclass initialization (`__init__`) will raise a `NotImplementedError`, preventing the class from being created without these crucial methods. This enforcement is crucial for maintaining a standard configuration and operational protocol for all network devices.

### Configuration and Security Setup

Through static methods such as `setup_security_defaults` and `vlan_management`, the metaclass configures default security and VLAN settings for devices. These methods are not just utility functions but are integral in setting up each device with standard configurations which include passwords, VLAN settings, and logging capabilities.

### Practical Usage of Metaclass Methods

Classes `Router`, `Switch`, and `Firewall` are derived from the `Net_Inv_Meta` metaclass, each with properties and methods tailored to their specific functions. They utilize inherited methods like `base_info`, which fetches and displays device information, and action methods like `connect` and `update_firmware`. This demonstrates the power of metaclasses to provide shared functionality that can be easily accessed and overridden by child classes as needed.

### Real-world Application and Benefits

Apart from Network aspects Metaclasses have multiple real-world use cases:

1. **Class Validation and Consistency** Metaclasses can be used to enforce rules or constraints on class definitions. For example, a metaclass could ensure that all subclasses implement certain abstract methods, or have certain necessary attributes. This is useful in frameworks or libraries where rigorous consistency between derived components is necessary.
2. **Automatic Class Registration** In some systems, it can be useful to have an automatic registry of classes that are defined, to facilitate their dynamic discovery and use. Metaclasses can automatically register each newly created class in a central registry, which can then be used for reflection purposes, factory patterns, or plugin systems.
3. **Modification of Class Structure** Metaclasses can modify or enrich classes at the time of their definition. This can include adding new methods or attributes, modifying inheritance, or altering the behavior of existing methods. This is particularly useful in development frameworks where advanced functionality or custom behaviors are desired without requiring the programmer to write additional code.
4. **Singleton Pattern** Metaclasses can be used to implement the Singleton pattern, ensuring that only one instance of a class is created for the entire duration of the application. This is useful for managing shared resources or providing a global access point.
5. **Aspect-Oriented Programming (AOP)** Metaclasses allow the implementation of AOP concepts in Python, enabling the insertion of code (such as logging, error handling, or performance measurements) in a transparent and non-invasive way across classes.

### Summary

This code provides a robust framework for managing network devices using Python’s advanced programming features like metaclasses. It showcases how Python can be used effectively to implement patterns that are not only efficient but also enforce a level of standardization and automation in managing network infrastructure.