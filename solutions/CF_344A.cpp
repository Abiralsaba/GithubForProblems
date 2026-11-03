#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    string prev, cur;
    cin >> prev;
    int ans = 1;
    for (int i = 1; i < n; i++) {
        cin >> cur;
        if (cur != prev) ans++;
        prev = cur;
    }
    cout << ans << '\n';
    return 0;
}
