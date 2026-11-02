#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    int ans = (n + m) / 3;
    if (ans > n) ans = n;
    if (ans > m) ans = m;
    cout << ans << endl;
    return 0;
}
