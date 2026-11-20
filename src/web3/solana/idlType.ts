/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/chain_play.json`.
 */
export type ChainPlay = {
  "address": "YtcQyJXwTkyYoXXu1MvEPoyW8GhTDWXJNtojtxdbGGn",
  "metadata": {
    "name": "chainPlay4",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "adminCloseMatchAccount",
      "docs": [
        "Admin-only instruction to close a match account and return rent to admin.",
        "Should only be used on terminal matches (completed/cancelled) or stuck matches."
      ],
      "discriminator": [
        133,
        186,
        176,
        217,
        26,
        56,
        212,
        185
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "address": "7zfU7MoMoTnjND2HcrDPVusDQzL66gD4uMrv7NPoMmMg"
        },
        {
          "name": "matchAccount",
          "docs": [
            "The match account to close — rent returned to player one"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "matchId"
              }
        },
      {
      "name": "createMatch",
      "docs": [
        "Player 1 creates a match and locks their wager into the match escrow PDA.",
        "match_id is generated client-side (e.g. a UUID) and passed in."
      ],
      "discriminator": [
        107,
        2,
        184,
        145,
        70,
        142,
        17,
        165
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userData"
          ]
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "matchAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "matchId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "wagerAmount",
          "type": "u64"
        },
        {
          "name": "gameMode",
          "type": "u8"
        },
        {
          "name": "gameId",
          "type": "string"
        },
        {
          "name": "invitedPlayer",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userData"
          ]
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint",
          "docs": [
            "USDC mint — must match the one the vault was initialised with."
          ]
        },
        {
          "name": "userUsdc",
          "docs": [
            "User's USDC token account (source of the deposit)."
          ],
          "writable": true
        },
        {
          "name": "vaultToken",
          "docs": [
            "Program token vault (destination)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "gameInteraction",
      "discriminator": [
        45,
        98,
        207,
        209,
        110,
        92,
        25,
        46
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userData"
          ]
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeVault",
      "discriminator": [
        48,
        191,
        163,
        44,
        71,
        129,
        63,
        164
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "7zfU7MoMoTnjND2HcrDPVusDQzL66gD4uMrv7NPoMmMg"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint",
          "docs": [
            "The USDC mint this program settles in (devnet vs mainnet differ)."
          ]
        },
        {
          "name": "vaultToken",
          "docs": [
            "Program-owned token account that physically holds ALL user/escrow/revenue USDC.",
            "Authority is the vault PDA; balances are tracked in the ledger fields."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "joinMatch",
      "docs": [
        "Player 2 joins an existing match by match_id and locks the same wager amount.",
        "Once this succeeds, the match moves to Active status — backend confirms via WagerLocked + MatchReady events."
      ],
      "discriminator": [
        244,
        8,
        47,
        130,
        192,
        59,
        179,
        44
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userData"
          ]
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "matchAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "matchId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        }
      ]
    },
    {
      "name": "refundMazeMatch",
      "docs": [
        "Admin-only refund for an active maze match.",
        "Splits the escrow equally between both players; rent from closing the account goes to admin."
      ],
      "discriminator": [
        148,
        129,
        137,
        223,
        128,
        35,
        198,
        118
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "address": "7zfU7MoMoTnjND2HcrDPVusDQzL66gD4uMrv7NPoMmMg"
        },
        {
          "name": "matchAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  116,
                  99,
                  104
     
        116,
        24
      ],
      "accounts": [
        {
    
            "Platform vault — receives 2.5% of the pot as revenue"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "movesP1",
          "type": "bytes"
        },
        {
          "name": "movesP2",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "settleMazeMatch",
      "docs": [
        "Called by the backend server to settle a maze wager match.",
        "The server determines the winner off-chain and passes the winning pubkey directly.",
        "No move replay or signature verification — maze move sets are too large for on-chain verification."
      ],
      "discriminator": [
        191,
        128,
        232,
        221,
        24,
        170,
        196,
        92
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Backend server (admin) signs this transaction"
          ],
          "writable": true,
          "signer": true,
          "address": "7zfU7MoMoTnjND2HcrDPVusDQzL66gD4uMrv7NPoMmMg"
        },
        {
          "name": "matchAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "matchId"
              }
            ]
          }
        },
        {
          "name": "playerOneAccount",
          "docs": [
            "Player 1's user PDA — receives payout if they win"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "match_account.player_one",
                "account": "matchAccount"
              }
            ]
          }
        },
        {
          "name": "playerTwoAccount",
          "docs": [
            "Player 2's user PDA — receives payout if they win"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "match_account.player_two",
                "account": "matchAccount"
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "Platform vault — receives 2.5% of the pot as revenue"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "winner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "userData"
          ]
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "userUsdc",
          "docs": [
            "User's USDC token account (destination). Created if it doesn't exist yet."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultToken",
          "docs": [
            "Program token vault (source)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFromVault",
      "discriminator": [
        180,
        34,
        37,
        46,
        156,
        0,
        211,
        238
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "address": "7zfU7MoMoTnjND2HcrDPVusDQzL66gD4uMrv7NPoMmMg"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "adminUsdc",
          "docs": [
            "Admin's USDC token account (destination). Created if it doesn't exist yet."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "usdcMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultToken",
          "docs": [
            "Program token vault (source)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "matchAccount",
      "discriminator": [
        235,
        36,
        243,
        39,
        81,
        16,
        144,
        87
      ]
    },
    {
      "name": "userData",
      "discriminator": [
        139,
        248,
        167,
        203,
        253,
        220,
        210,
        221
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "eventGameInteraction",
      "discriminator": [
        208,
        90,
        176,
        24,
        115,
        194,
        160,
        128
      ]
    },
    {
      "name": "matchCancelled",
      "discriminator": [
        99,
        86,
        22,
        122,
        82,
        247,
        60,
        113
      ]
    },
    {
      "name": "matchCreated",
      "discriminator": [
        151,
        176,
        11,
        24,
        34,
        225,
        227,
        16
      ]
    },
    {
      "name": "matchReady",
      "discriminator": [
        2,
        60,
        163,
        225,
        124,
        75,
        32,
        232
      ]
    },
    {
      "name": "matchRefunded",
      "discriminator": [
        185,
        57,
        210,
        244,
        121,
        237,
        113,
        232
      ]
    },
    {
      "name": "matchSettled",
      "discriminator": [
        243,
        201,
        134,
        151,
        193,
        131,
        223,
        150
      ]
    },
    {
      "name": "wagerLocked",
      "discriminator": [
        73,
        35,
        162,
        159,
        119,
        61,
        214,
        42
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6001,
      "name": "invalidMatchStatus",
      "msg": "Match is not in the correct status for this action"
    },
    {
      "code": 6002,
      "name": "notAParticipant",
      "msg": "You are not a participant in this match"
    },
    {
      "code": 6003,
      "name": "wagerMismatch",
      "msg": "Wager amount does not match the required amount"
    },
    {
      "code": 6004,
      "name": "invalidMove",
      "msg": "Invalid move — must be 0 (Rock), 1 (Paper), or 2 (Scissors)"
    },
    {
      "code": 6005,
      "name": "invalidRoundCount",
      "msg": "Invalid number of rounds for this game mode"
    },
    {
      "code": 6006,
      "name": "invalidMoveSignature",
      "msg": "Invalid move signature"
    },
    {
      "code": 6007,
      "name": "unauthorized",
      "msg": "Only admin can perform this action"
    },
    {
      "code": 6008,
      "name": "matchFull",
      "msg": "Match already has two players"
    },
    {
      "code": 6009,
      "name": "cannotJoinOwnMatch",
      "msg": "Player cannot join their own match"
    },
    {
      "code": 6010,
      "name": "notInvited",
      "msg": "This match is invite-only and you were not invited"
    },
    {
      "code": 6011,
      "name": "cannotInviteSelf",
      "msg": "You cannot invite yourself to a match"
    },
    {
      "code": 6012,
      "name": "playerAlreadyInMatch",
      "msg": "Already in a match"
    },
    {
      "code": 6013,
      "name": "incompleteMatch",
      "msg": "Match is Incomplete"
    },
    {
      "code": 6014,
      "name": "disputeMatch",
      "msg": "Dispute Match"
    },
    {
      "code": 6015,
      "name": "wrongSettlementInstruction",
      "msg": "Wrong settlement instruction for this game type"
    },
    {
      "code": 6016,
      "name": "missingPlayerTwoAccount",
      "msg": "Player 2 Account Missing from close match instruction"
    },
    {
      "code": 6017,
      "name": "invalidMint",
      "msg": "Token account mint does not match the vault's configured USDC mint"
    }
  ],
  "types": [
    {
      "name": "eventGameInteraction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "matchAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "playerOne",
            "type": "pubkey"
          },
          {
            "name": "playerTwo",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "invitedPlayer",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "wagerAmount",
            "type": "u64"
          },
          {
            "name": "escrowBalance",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "matchStatus"
              }
            }
          },
          {
            "name": "gameMode",
            "type": "u8"
          },
          {
            "name": "totalRounds",
            "type": "u8"
          },
          {
            "name": "roundsToWin",
            "type": "u8"
          },
          {
            "name": "p1Wins",
            "type": "u8"
          },
          {
            "name": "p2Wins",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "matchCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "refundedTo",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "matchCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "playerOne",
            "type": "pubkey"
          },
          {
            "name": "invitedPlayer",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "wagerAmount",
            "type": "u64"
          },
          {
            "name": "gameMode",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "matchReady",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
      
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "matchStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "waitingForPlayer"
          },
          {
            "name": "active"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "userData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "xp",
            "type": "u64"
          },
          {
            "name": "activeMatch",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalDeposits",
            "type": "u64"
          },
          {
            "name": "revenue",
            "type": "u64"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "wagerLocked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
