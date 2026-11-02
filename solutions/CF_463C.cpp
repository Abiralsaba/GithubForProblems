#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    const int SHIFT = 2000;
    const int MAXD = 4005;               // enough for [-1999,1999] after shift
    long long mx[2][MAXD];
    for (int p = 0; p < 2; p++)
        for (int i = 0; i < MAXD; i++) mx[p][i] = 0;
    for (int i = 0; i < n; i++) {
        int x, y;
        long long a;
        cin >> x >> y >> a;
        int id = x - y + SHIFT;
        int par = (x + y) & 1;
        if (a > mx[par][id]) mx[par][id] = a;
    }
    long long ans = 0;
    for (int p = 0; p < 2; p++)
        for (int i = 0; i < MAXD; i++) ans += mx[p][i];
    cout << ans << endl;
    return 0;
}
