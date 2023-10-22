const board = document.getElementsByClassName("board")[0];
const diff_options = document.getElementsByName("diff");

let width = 9;
let height = 9;
let mines = 10;
board_state = [];
board_truth = [];
// Create an empty html collectino object (not trivial)
let images = document.createElement("div").getElementsByClassName('noClassHere');
load_page();
board_init();

for (let e of diff_options)
{
    e.addEventListener("click", () => {
        if (e.id == "beg")
        {
            width = 9;
            height = 9;
            mines = 10;
        }
        else if (e.id == "int")
        {
            width = 16;
            height = 16;
            mines = 40;
        }
        else if (e.id == "exp")
        {
            width = 30;
            height = 16;
            mines = 99;
        }
        else
        {
            alert('error');
        }
        load_page();
        board_init();
    })
}

function load_page()
{
    let columnString = "";
    for (let i = 0; i < width; i++)
    {
        columnString += "20px ";
    }
    board.style.setProperty("grid-template-columns", columnString);
    fill_squares_from_array(0,0,1);
}

function board_init(value=1)
{
    for (let i = 0; i < height; i++)
    {
        board_state[i] = [];
        for (let j = 0; j < width; j++)
        {
            board_state[i][j] = value;
        }
    }
}

function check_current_square(i,j)
{
    if (Array.isArray(board_truth) && board_truth.length)
    {
        value = board_truth[i][j];
        if (value == 9)
        {
            console.log("GAME OVER!\n");
        }
        else
        {
            let row_elements = board.querySelectorAll('[row-id="'+i+'"]');
            for (let item of row_elements)
            {
                if (item.getAttribute("col-id") == j)
                {
                    item.src = "./pngs/"+board_truth[i][j]+".PNG";
                }
            }
        }
    }
    else
    {
        // DEBUG
        console.log("Current row: "+i);
        console.log("Current col: "+j);

        let row_elements = board.querySelectorAll('[row-id="'+i+'"]');
        for (let item of row_elements)
        {
            if (item.getAttribute("col-id") == j)
            {
                item.src = "./pngs/0.PNG";
            }
        }
    }

    // Uncover just the clicked square
    board_state[i][j] = 0;
}

function update_board(i,j)
{
    // Changes the contents of board_state based on board_truth
    if (Array.isArray(board_truth) && board_truth.length)
    {
        if (board_state[i][j] != 0)
        {
            console.log("ERROR in update_board: something went wrong");
        }
        // Only need to do anything at all, if board_truth[i][j] is zero.
        recurse_uncover(Number(i),Number(j));
    }
}

function fill_squares_from_array(current_row=0, current_col=0, ini=0)
{
    // ini is 1 if first time page load or difficulty switch.
    // value will come from load_page and or the other one for setting array values.
    if (ini)
    {
        let board_inner_html = "";
        for (let i = 0; i < height; i++)
        {
            for (let j = 0; j < width; j++)
            {
                board_inner_html += `<img src="./pngs/covered.PNG" alt="" row-id="`+i+`" col-id="`+j+`">\n`
            }
        }
        board.innerHTML = board_inner_html;
        images = board.getElementsByTagName("img");
        for (let im of images)
        {
            let row = im.getAttribute("row-id");
            let col = im.getAttribute("col-id");
            im.addEventListener("click", function() {
                // Initialize board_truth if not already done so
                if (!(Array.isArray(board_truth) && board_truth.length))
                {
                    initialize_board(row, col);
                }
                check_current_square(row, col);
                update_board(row,col);
                fill_squares_from_array(row, col);
            });
        }
        // Make sure board_truth is NOT initialized
        board_truth = [];
    }

    else
    {
        let temp = "";
        for (let i = 0; i < height; i++)
        {
            for (let j = 0; j < width; j++)
            {
                if (board_state[i][j] == 1)
                {
                    temp = "./pngs/covered.PNG";
                }
                else
                {
                    temp = "./pngs/"+board_truth[i][j]+".PNG";
                }
                let row_elements = board.querySelectorAll('[row-id="'+i+'"]');
                for (let item of row_elements)
                {
                    if (item.getAttribute("col-id") == j)
                    {
                        item.src = temp;
                    }
                }
            }
        }
    }
}

function initialize_board(current_row, current_col)
{
    let num_squares = width*height;
    let input_data = [];
    let count = 0;
    let square = 0;
    let num_free_squares = 9;
    // Edge clicks
    if (current_row == 0 || current_row == height-1)
    {
        if (current_col == 0 || current_col == width-1)
        {
            num_free_squares = 4;
        }
        else
        {
            num_free_squares = 6;
        }
    }
    else if (current_col == 0 || current_col == width-1)
    {
        num_free_squares = 6;
    }
    for (let i = 0; i < num_squares - num_free_squares; i++)
    {
        p = (mines - count) / (num_squares - num_free_squares - square);
        r = Math.random();
        if (r < p)
        {
            input_data[square] = 1;
            count += 1;
            square += 1;
        }
        else
        {
            input_data[square] = 0;
            square += 1;
        }
    }
    
    let current_elem = 0; 
    for (let i = 0; i < height; i++)
    {
        board_truth[i] = [];
        for (let j = 0; j < width; j++)
        {
            if ((Math.abs(current_row - i) > 1) || (Math.abs(current_col - j) > 1))
            {
                board_truth[i][j] = 9 * input_data[current_elem];
                current_elem += 1;
            }
            else
            {
                board_truth[i][j] = 0;
            }
        }
    }
    
    // Compute numbers in the underlying board
    for (let i = 0; i < height; i++)
    {
        for (let j = 0; j < width; j++)
        {
            if (board_truth[i][j] == 0)
            {
                let adj_count = 0;
                for (let v = Math.max(0,i-1); v < Math.min(i+2,height); v++)
                {
                    for (let h = Math.max(0,j-1); h < Math.min(j+2,width); h++)
                    {
                        if (board_truth[v][h] == 9)
                        {
                            adj_count += 1;
                        }
                    }
                }
                board_truth[i][j] = adj_count;
            }
        }
    }
    // Let me know if the first clicked square is somehow not zero (error)
    if (board_truth[current_row][current_col] != 0)
    {
        console.log("ERROR: initialiazation")
    }
}

function recurse_uncover(i,j)
{
    if (board_truth[i][j] == 0)
    {
        for (let v = Math.max(0,i-1); v < Math.min(i+2,height); v++)
        {
            for (let h = Math.max(0,j-1); h < Math.min(j+2,width); h++)
            {
                if (board_state[v][h] == 1)
                {
                    board_state[v][h] = 0;
                    recurse_uncover(v,h);
                }
            }
        }
    }
}