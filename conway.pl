% defines rules for conway's game of life

horiz_neighbors(LIST, X, HNEIGHBORS) :-
    (X >= length(LIST); X < 2),
    fail.
horiz_neighbors([I | J | K | REST],  X,  [I, J, K]) :-
    X = 2.
horiz_neighbors([_ | LIST], X, HNEIGHBORS) :-
    horiz_neighbors(LIST, X-1, HNEIGHBORS).

full_neighbors(GRID, X, Y, NEIGHBORS) :-
    (Y >= length(GRID); X < 2),
    fail.
full_neighbors([ROWI | ROWJ | ROWK | REST], X, Y, [HNROWI, HNROWJ, HNROWK]) :-
    Y = 2,
    horiz_neighbors(ROWI, X, HNROWI),
    horiz_neighbors(ROWJ, X, HNROWJ),
    horiz_neighbors(ROWK, X, HNROWK).
full_neighbors([_ | ROWS], X, Y, NEIGHBORS) :-
    full_neighbors(ROWS, X, Y-1, NEIGHBORS).

row_sum([], 0).
row_sum([X| XS], SUM) :-
    row_sum(XS, REST_SUM),
    SUM is X + REST_SUM.

sum([], 0).
sum([ROW| ROWS], SUM) :-
    row_sum(ROW, CUR_SUM),
    sum(ROWS, REST_SUM),
    SUM is CUR_SUM + REST_SUM.


next_cell( GRID, I, J, 0 ) :- %underpopulation
    cell_at(GRID, I, J) = 1,
    full_neighbors( GRID, I, J, NEIGHBORS ),
    sum(NEIGHBORS, NUM_LIVE),
    NUM_LIVE < 2.
next_cell( GRID, I, J, 0 ) :- %overpopulation
    cell_at(GRID, I, J) = 1,
    full_neighbors( GRID, I, J, NEIGHBORS ),
    sum(NEIGHBORS, NUM_LIVE),
    NUM_LIVE > 3.
next_cell( GRID, I, J, 1 ) :- %maintain
    cell_at(GRID, I, J) = 1,
    full_neighbors( GRID, I, J, NEIGHBORS ),
    sum(NEIGHBORS, NUM_LIVE),
    NUM_LIVE > 2,
    NUM_LIVE < 3.
next_cell( GRID, I, J, 1 ) :-
    cell_at(GRID, I, J) = 0,
    full_neighbors( GRID, I, J, NEIGHBORS ),
    sum(NEIGHBORS, NUM_LIVE),
    NUM_LIVE =3.
next_cell( GRID, I, J, 0 ).
    


%defines iteration to calculate next for generic cellular automaton

is_grid(GRID) :-
    same_row_lengths(GRID).

same_row_lengths([]).
same_row_lengths([A | B | GRID]) :-
    length(A, L1),
    length(B, L2),
    L1 = L2,
    same_row_lengths([B | GRID]).

grid_same_size(A, B) :-
    is_grid(A),
    is_grid(B),
    
    length(A, LA),
    length(B, LB),
    LA = LB,

    nth1(1, A, RA),
    length(RA, LRA),
    nth1(1, B, RB),
    length(RB, LRB),
    LRA = LRB.

next_iteration(PREV, NEXT) :-
    grid_same_size(PREV, NEXT),
    length(PREV, NUMROWS),
    nth1(1, PREV, PR),
    length(PR, NUMCOLS),
    next_rows(PREV, NEXT, NUMROWS, NUMCOLS).

next_rows(PREV, NEXT, 0, CURCOL).
next_rows(PREV, NEXT, CURROW, CURCOL) :-
    next_cells(PREV, NEXT, CURROW, CURCOL),
    next_rows(PREV, NEXT, CURROW-1, CURCOL).

next_cells(PREV, NEXT, CURROW, 0).
next_cells(PREV, NEXT, CURROW, CURCOL) :-
    next_cell(PREV, CURROW, CURCOL, VAL),
    nth1(CURROW, NEXT, NEXTROW),
    nth1(CURCOL, NEXTROW, VAL),
    next_cells(PREV, NEXT, CURROW, CURCOL-1).

    
