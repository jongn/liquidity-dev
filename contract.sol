pragma solidity ^0.4.0;

import "std.sol";

contract Contract is owned {
    
    enum Stages {
        GamePlaying,
        GameStopped,
        Payout,
        Overtake
    }
  
    struct Player {
        address addr;
        uint256 balance;
        uint256 paid;
    }
  
    Player king;
    Player challenger;
    Player[] players;
    uint256 pot;
    uint256 threshold;
    Stages stage;
    
    uint8[3] row1 = [0,0,0];
    uint8[3] row2 = [0,0,0];
    uint8[3] row3 = [0,0,0];
    uint8[3][3] board = [row1, row2, row3];
    
    address player1;
    address player2;
    
    bool game_over;
    bool player1_turn;
    bool private lock;
    
    address winner;

    event GameWon(address winner);
    event Move();
    
    modifier atStage(Stages _stage) {
        if (stage != _stage) throw;
        _;
    }
    
    modifier onlyBy(Player _player)
    {
        if (msg.sender != _player.addr)
            throw;
        _;
    }
    
    modifier onlyByBoth(Player _king, Player _challenge)
    {
        if (msg.sender != _king.addr && msg.sender != _challenge.addr)
            throw;
        if (msg.sender == _king.addr && !player1_turn)
            throw;
        if (msg.sender == _challenge.addr && player1_turn)
            throw;
        _;
    }
    
    modifier costsAtLeast(uint _amount) {
        if (msg.value < _amount)
            throw;
        _;
    }
    
    modifier costsExactly(uint _amount) {
        if (msg.value < _amount)
            throw;
        _;
        if (msg.value > _amount)
            msg.sender.send(msg.value - _amount);
    }
    
    function payout() onlyByBoth(king, challenger) {

        if (!lock) {
            lock = true;
        
            address winner = get_winner();
            uint256 amount = pot;
            
            
            if(winner == king.addr) {
                stage = Stages.Payout;
                // king wins
                // player pays at least 1.1x 

                uint256 winnings = (amount*11)/10;
                players[0].balance -= winnings;
                // king leaves, player becomes king
                king.addr.send(winnings);
                king = players[0];
                // set next player
                
                // reset game
                threshold = (pot*11)/10;
                
                lock = false;
            } else if(winner == players[0].addr) {
                stage = Stages.Payout;
                // challenger wins
                
                king.balance += amount;
                // have challenger specify amount
                stage = Stages.Overtake;
                // set next player
                // reset game
                lock = false;
            } else {
                // no one won. why are you calling this function??
                lock = false;
                throw;
            }
        }


    }
    
    function challengerWin(uint256 amount) onlyBy(challenger) atStage(Stages.Overtake) {
        // set next player
        // reset game
        if (!lock) {
            if (amount < pot) {
                lock = false;
                throw;
            }
            if (amount > challenger.balance) {
                lock = false;
                throw;
            }
            challenger.balance -= amount;
            pot = amount;
            threshold = (pot*11)/10;
            king = challenger;
            // set next challenger
            // reset game
            // state = States.GameStopped;
        } else {
            throw;
        }
    }
    
    /*
    mapping (address => uint) private userBalances;

    function withdrawBalance() public {
        uint amountToWithdraw = userBalances[msg.sender];
        userBalances[msg.sender] = 0;
        if (!(msg.sender.call.value(amountToWithdraw)())) { throw; } // The user's balance is already 0, so future invocations won't withdraw anything
    }
    */

    function TicTacToe(address _player2){
        //msg , value, sender, gas,
        player1 = msg.sender;
        player2 = _player2;
        game_over = false;
        player1_turn = true;
    }

    function get_winner() constant returns(address){
        return winner;
    }

    function check_column(uint8 i) constant returns (uint8){
        uint8 current_token = 0;
        if(board[0][i] == 0){
            return current_token;
        } else{
            current_token = board[0][i];
        }
        for(uint8 k = 1; k< board.length; ++k){
            if(board[k][i] != current_token){
                return 0;
            }
        }

        return current_token;
    }

    function check_row(uint8 i) constant returns (uint8){
        uint8 current_token = 0;
        if(board[i][0] == 0){
            return current_token;
        } else{
            current_token = board[i][0];
        }
        for(uint8 k = 1; k < board[i].length ; k++){
            if(board[i][k] != current_token){
                return 0;
            }
        }

        return current_token;
    }

    function check_diagonals() constant returns(uint8){
        uint8 current_token = board[1][1];
        if(current_token == 0){
            return current_token;
        }
        if((board[0][0] == current_token && board[2][2] == current_token) || (board[2][0] == current_token && board[0][2] == current_token)){
            return current_token;
        }
        return 0;
    }

    function check_if_winner() constant returns(uint8){
        uint8 possible_winner = 0;
        for(uint8 i = 0; i < board.length; ++i){
            possible_winner = check_column(i);
            if(possible_winner != 0){
                return possible_winner;
            }
        }
        for(i = 0; i < board[0].length; ++i){
            possible_winner = check_row(i);
            if(possible_winner != 0){
                return possible_winner;
            }
        }
        possible_winner = check_diagonals();
        return possible_winner;
    }

    function make_move(uint8 i, uint8 k){

        if(game_over){
            throw;
        }
        if(msg.sender != player1 && msg.sender != player2){
            throw;
        }
        if(player1_turn){
            if(msg.sender != player1){
                throw;
            }
        }
        if(!player1_turn){
            if(msg.sender != player2){
                throw;
            }
        }
        uint8 token;

        uint8 current_index_state = get_index(i, k);
        if(current_index_state == 1 || current_index_state == 2){
            throw;
        }
        if(msg.sender == player1){
            token = 1;
        }
        if(msg.sender == player2){
            token = 2;
        }
        change_index(i, k, token);
        //board[i][k] = token;
        uint8 _winner = check_if_winner();
        if(_winner != 0){
            if(_winner == 1){
                winner = player1;
            } else if(_winner == 2){
                winner = player2;
            }
            game_over = true;
            GameWon(winner);
        }
        player1_turn = complement(player1_turn);
        Move();
    }

    function get_index(uint8 i, uint8 k) private constant returns (uint8){
        return board[i][k];
    }

    function game_state() constant returns (uint8[3][3]){
        return board;
    }

    function change_index(uint8 i, uint8 k, uint8 x) private {
        board[i][k] = x;
    }

    function complement(bool b) returns(bool){
        if(b == true){
            return false;
        } else if(b == false){
            return true;
        }
    }

}
