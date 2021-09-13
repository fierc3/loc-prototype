
const introCode: string =`
/*THESE METHODS HAVE BEEN IMPLEMENTED. USE THEM IN THE CODE SECTION BELOW. Theyre redecalred here for the autocomplete function and as an overview for you as a player / coder */
type Entity = { id :number,type: string,row : number,col : number,movement: number,initiative: number,attack:number,props:any}
const getEntities = (type:string) :Entity[] => {/*Get all entities of type*/return[]};
const findEntityById = (id:number):Entity | undefined => {/*Get specific entity by id*/return}
const getEntityOnTile=(col:number, row:number):Entity |undefined => {/*Get Entity on specific tile*/return}
const [getMonsters,getRocks, findQueen,getHero]= [():Entity[] =>{/*gets entity*/return},():Entity[] =>{/*gets entity*/return},():Entity =>{/*gets entity*/return},():Entity =>{/*gets entity*/return}];
const [moveHeroUp, moveHeroDown,moveHeroLeft,moveHeroRight]  = [() => {/*hero moves */},() => {/*hero moves */},() => {/*hero moves */},() => {/*hero moves */},() => {/*hero moves */}]
const [attackUp,attackDown,attackLeft,attackRight] = [() => {/*hero attacks*/},() => {/*hero attacks*/},() => {/*hero attacks*/},() => {/*hero attacks*/},() => {/*hero attacks*/}]
const Memory:any[] = []; //This array is the only way to save information for multiplee turns
/*LEVEL 2 abilities */ const spinAttack = () => {};
/*LEVEL 3 abilities */ const selfHeal = () => {};

/**RULES
 * Victory: Reach the queen (move into her)
 * Lose: Hero has 0 HP
 * 
 * Your code below will execute once per turn. The turn order is determined by an entities speed.
 * In most cases your hero will have first turn.
 * In your turn you can only do 1 movement action and 1 attack/interact action
 * 
 */

///////END INTRO///////
//We do NOT recommend to delete the above declared constants


// Start writing your per turn code here. Below you see some sample code showing what the hero does per turn.

                    // START CODING HERE //

//The follwing code sample is a FAULTY and unfinished pathing logic snippet, try fixing and evolving it!
var hero = getHero();
var queen = findQueen();
var colDiff = hero.col - queen.col;
var rowDiff = hero.row - queen.row;

if (Math.abs(rowDiff) > Math.abs(colDiff)) { // check which axis is further away, then reduce the one closer
        //reduce row axis
        if (rowDiff < 0) {
          var isBlocked = moveHeroDown();
        } else if (rowDiff >= 1) {
           var isBlocked = moveHeroUp();
        }
      } else {
        //recude col axis
        if (colDiff < 0) {
           //var isBlocked = moveHeroRight();  is this right or left? hmmmm I forgor
        } else if (colDiff >= 1) {
           //missing......
        }
      }

`

export default introCode;