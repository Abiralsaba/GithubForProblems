#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, ok = 0;
    cin >> n;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        if (x == 1) ok = 1;
    }
    if (ok) cout << "HARD\n";
    else cout << "EASY\n";
    return 0;
}
