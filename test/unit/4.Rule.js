module("Rule");

test("Undefined", function() {
	
	strictEqual( dominoes.rule("non-existing") , undefined , "Undefined was returned" );
	
});

test("Setting / retrieving", function() {
	
	strictEqual ( dominoes.rule( "test" , "SOME_URL" ) , dominoes , "Setting a rule returns dominoes" );
	strictEqual ( {}.toString.call ( dominoes.rule( "test" ) ) , "[object Function]" , "Rules are stored as functions" );
	
});

test("Deleting" , function() {
	
	dominoes.rule( "toDelete" , "will be deleted" );
	dominoes.rule( "toDelete" , false );
	
	strictEqual( dominoes.rule( "toDelete" ) , undefined , "Property has been deleted" );
	
});

test("Empty list" , function() {
	
	dominoes.rule( "NAME1" , "" );
	dominoes.rule( "NAME2" , "" );
	
	dominoes.rule( false );
	
	strictEqual( dominoes.rule("NAME1") , undefined , "Rule 1 was removed" );	
	strictEqual( dominoes.rule("NAME2") , undefined , "Rule 2 was removed" );	
	
});

test("Expansion" , function() {
	
	expect( 2 );
	
	stop();
	
	var string = "";
	
	dominoes.rule( "myFunction" , function() {
		
		string += "myFunction was called";
		
	});
	
	dominoes( "myFunction" , function() {
		
		strictEqual( string , "myFunction was called" , "Rules was properly expanded" );
		
	} , "myFunction" , function() {
		
		strictEqual( string, "myFunction was called" , "Rules are only executed once" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("On-the-fly definition" , function() {
	
	expect( 1 );
	
	stop();
	
	var string = "";
	
	dominoes( function() {
		
		dominoes.rule("myFunction" , function() {
			
			string += "myFunction was called";
			
		});
		
	} , "myFunction" , function() {

		strictEqual( string, "myFunction was called" , "Rules can be created on-the-fly" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("Multiple definition" , function() {
	
	expect( 1 );
	
	stop();
	
	var string = "";
	
	dominoes.rule( "myFunction" , function() {
		
		string += "rule 1, ";
		
	});
	
	dominoes.rule( "myFunction" , function() {
		
		string += "rule 2";
		
	});
	
	dominoes( "myFunction" , function() {

		strictEqual( string, "rule 1, rule 2" , "Rules accept multiple definitions" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("On-the-fly multiple definition" , function() {
	
	expect( 1 );
	
	stop();
	
	var string = "";
	
	dominoes.rule( "myFunction" , function() {
		
		string += "rule 1, ";
		
		dominoes.rule( "myFunction" , function() {
			
			string += "rule 2";
			
		});
	
	});
	
	dominoes( "myFunction" , function() {

		strictEqual( string, "rule 1, rule 2" , "Rules accept multiple definitions" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("Recursive definitions" , function() {
	
	expect( 1 );
	
	stop();
	
	var flag = false;
	
	dominoes.rule( "secondLevel" , function() {
		
		flag = true;
		
	} );
	
	dominoes.rule( "firstLevel" , "secondLevel" );
	
	dominoes( "firstLevel" , function() {
		
		ok( flag , "Recursive definition was expanded" );
		dominoes.rule( false );
		start();
		
	} );
	
});

test("Async URL rule" , function() {
	
	expect( 1 );
	
	stop();
	
	window.DOMINOES_UNIT_STRING = "";
	
	dominoes.rule( "url" , url("./data/concat.php?wait=200&str=a") );
	
	dominoes( "url" , function() {
		
		strictEqual( window.DOMINOES_UNIT_STRING , "a" , "Script was blocking" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("Async function rule" , function() {
	
	expect( 1 );
	
	stop();
	
	window.DOMINOES_UNIT_STRING = "";
	
	dominoes.rule( "function" , function( callback ) {
		setTimeout( function() {
			window.DOMINOES_UNIT_STRING += "a";
			callback();
		} , 100);
		return false;
	} );
	
	dominoes( "function" , function() {
		
		strictEqual( window.DOMINOES_UNIT_STRING , "a" , "Script was blocking" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("Not called twice" , function() {
	
	expect( 1 );
	
	stop();
	
	var string = "";
	
	dominoes.rule("DONE" , function() {
		string += "DONE";
	});
	
	dominoes( "DONE DONE" , function() {
		
		strictEqual( string , "DONE" , "Rule was executed only once" );
		dominoes.rule( false );
		start();
		
	});
	
});

test("Sequenced dependencies" , function() {
	
	expect( 1 );
	
	stop();
	
	window.DOMINOES_UNIT_STRING = "";
	
	dominoes.rule( "module1.load" , url("./data/module.php?number=1") );
	dominoes.rule( "module2.load" , url("./data/module.php?number=2") );
	dominoes.rule( "module3.load" , url("./data/module.php?number=3") );
	
	dominoes.rule( "module1" , "module1.load > module1.start" );
	dominoes.rule( "module2" , "module2.load module1 > module2.start" );
	dominoes.rule( "module3" , "module3.load module2 > module3.start" );
	
	dominoes( "module3" , function() {
		
		strictEqual( window.DOMINOES_UNIT_STRING , "S1S2S3" , "Script cascading dependencies handled properly" );
		dominoes.rule( false );
		start();
	
	});
	
});

test("Sequenced dependencies (all together)" , function() {
	
	expect( 1 );
	
	stop();
	
	window.DOMINOES_UNIT_STRING = "";
	
	dominoes.rule( "module1.load" , url("./data/module.php?number=1") );
	dominoes.rule( "module2.load" , url("./data/module.php?number=2") );
	dominoes.rule( "module3.load" , url("./data/module.php?number=3") );
	
	dominoes.rule( "module1" , "module1.load > module1.start" );
	dominoes.rule( "module2" , "module2.load module1 > module2.start" );
	dominoes.rule( "module3" , "module3.load module2 > module3.start" );
	
	dominoes( "module1 module2 module3" , function() {
		
		strictEqual( window.DOMINOES_UNIT_STRING , "S1S2S3" , "Script cascading dependencies handled properly" );
		dominoes.rule( false );
		start();
	
	});
	
});

test("Grouped definitions" , function() {
	
	expect( 1 );
	
	stop();
	
	var string = "";
	
	dominoes.rule( {
		"one": function() {
			string += "rule 1, ";
		},
		"two": function() {
			string += "rule 2, ";
		},
		"three": function() {
			string += "rule 3";
		}
	});
	
	dominoes( "one > two > three" , function() {

		strictEqual( string, "rule 1, rule 2, rule 3" , "Grouped definitions worked" );
		dominoes.rule( false );
		start();
		
	});
	
});
