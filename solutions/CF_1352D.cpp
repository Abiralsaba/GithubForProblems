#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        int a[n];
        for (int i = 0; i < n; i++) cin >> a[i];
        int l = 0;
        int r = n - 1;
        int alice_total = 0;
        int bob_total = 0;
        int moves = 0;
        int prev_round = 0;
        int turn = 0;
        while (l <= r) {
            int curr_round = 0;
            if (turn == 0) {
                while (l <= r && curr_round <= prev_round) {
                    curr_round += a[l];
                    l++;
                }
                alice_total += curr_round;
            } else {
                while (l <= r && curr_round <= prev_round) {
                    curr_round += a[r];
                    r--;
                }
                bob_total += curr_round;
            }
            prev_round = curr_round;
            moves++;
            turn = 1 - turn;
        }
        cout << moves << " " << alice_total << " " << bob_total << endl;
    }
    return 0;
}
