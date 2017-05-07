const config = require( '../config/levels.json' );
const names = Array.prototype.concat( ...config.map( ( { names } ) => names ) );
const values = config.map( ( { value } ) => value );
const operators = [ '+', '-', '!' ];
const selectors = [ '=', '*', '<', '>' ];
const has = ( name ) => names.indexOf( name ) >= 0;
const value = ( name ) => config.find( ( { names } ) => names.indexOf( name ) >= 0 ).value;
module.exports = {
	config, names, values, has, value,
	resolveValues: ( args ) => Array.prototype.concat( ...Array.prototype.concat( args )
			.map( item => item.toString() )
			.map( item => [ item.charAt( 0 ), item ] )
			.map( ( [ operator, item ] ) => operators.indexOf( operator ) < 0 ?
				[ true, item ] : [ operator === '+', item.slice( 1 ) ] )
			.map( ( [ operator, item ] ) => [ operator, item.charAt( 0 ), item ] )
			.map( ( [ operator, selector, item ] ) => selectors.indexOf( selector ) < 0 ?
				[ operator, '=', item ] : [ operator, selector, item.slice( 1 ) ] )
			.map( ( [ operator, selector, item ] ) => {
				if( selector === '*' )
					return [ operator, selector ];
				else if( !isNaN( item ) )
					return [ operator, selector, parseInt( item, 10 ) ];
				else if( has( item ) )
					return [ operator, selector, value( item ) ];
				else
					throw new Error( `unknown level "${item}"` );
			} )
			.map( ( [ operator, selector, value ] ) => {
				if( selector === '*' )
					return values.map( value => ( { operator, value } ) );
				else if( selector === '<' )
					return values.filter( v => v < value ).map( value => ( { operator, value } ) );
				else if( selector === '>' )
					return values.filter( v => v > value ).map( value => ( { operator, value } ) );
				else
					return { operator, value };
			} ) )
		.filter( ( { value: val }, index, arr ) => !arr.some( ( { operator, value } ) => !operator && val === value ) )
		.map( ( { value } ) => value )
};
